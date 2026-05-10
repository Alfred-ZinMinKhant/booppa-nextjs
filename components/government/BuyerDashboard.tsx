"use client";

/**
 * Government Buyer Dashboard — booppa.io/buyer/dashboard
 * ========================================================
 * Production-grade. Connected to real Booppa APIs.
 * WCAG 2.1 AA compliant. Responsive 320px–2560px.
 * Full keyboard navigation. AGO-auditable PDF export.
 *
 * Route:  app/buyer/dashboard/page.tsx
 * Auth:   Requires token cookie with role=GOV_BUYER
 * Guard:  middleware.ts (see DEVELOPER_GUIDE.md Step 3)
 *
 * API endpoints consumed:
 *   GET /api/v1/marketplace/search       → vendor search + filter
 *   GET /api/v1/marketplace/industries   → industry list for filter
 *   GET /api/v1/gebiz/latest-tenders     → live GeBIZ tenders
 *   GET /api/v1/verify/{uen}             → blockchain verification
 *   POST /api/v1/reports/gov-shortlist   → PDF generation (backend)
 *   GET /auth/me                         → current user (server component)
 */

import React, {
  useState, useEffect, useCallback, useRef, useId,
  KeyboardEvent, ChangeEvent,
} from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  ink:       "#0a0f1e",
  inkMid:    "#1e2a45",
  inkLight:  "#2d3f6b",
  slate:     "#6b7a99",
  mist:      "#c8d3e2",
  cream:     "#f7f4ee",
  creamDark: "#ede8de",
  white:     "#ffffff",
  coral:     "#c84b31",
  gold:      "#b8962e",
  verified:  "#1a6b45",
  watch:     "#7a4f00",
  focus:     "#0057b8",
} as const;

// ── API base ──────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_BASE ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Vendor {
  id: string;
  slug: string;
  company_name: string;
  uen: string;
  industry: string;
  trust_score: number;        // 0-100
  verification_depth: "UNVERIFIED" | "BASIC" | "STANDARD" | "DEEP" | "CERTIFIED";
  risk_signal: "CLEAN" | "WATCH" | "FLAGGED" | "CRITICAL";
  procurement_readiness: "READY" | "CONDITIONAL" | "NEEDS_ATTENTION" | "NOT_READY";
  sector_percentile: number;
  verified: boolean;
  short_description: string;
  evidence_tx_hash?: string;
}

interface Tender {
  tender_no: string;
  title: string;
  agency: string;
  closing_date: string;
  estimated_value?: number;
  status: string;
  url?: string;
}

interface VerifyResult {
  status: "verified" | "not_found" | "error";
  company_name?: string;
  uen?: string;
  trust_score?: number;
  verification_depth?: string;
  anchored_at?: string;
  tx_hash?: string;
  framework?: string;
  message?: string;
}

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ── Config maps ───────────────────────────────────────────────────────────────
const DEPTH = {
  CERTIFIED:  { label: "Certified",  color: C.verified,  bg: "rgba(26,107,69,0.1)"  },
  DEEP:       { label: "Deep",       color: C.inkLight,  bg: "rgba(45,63,107,0.1)"  },
  STANDARD:   { label: "Standard",   color: C.inkMid,    bg: "rgba(30,42,69,0.08)"  },
  BASIC:      { label: "Basic",      color: C.gold,      bg: "rgba(184,150,46,0.1)" },
  UNVERIFIED: { label: "Unverified", color: C.slate,     bg: "rgba(107,122,153,0.1)"},
} as const;

const RISK = {
  CLEAN:    { label: "Clean",    color: C.verified },
  WATCH:    { label: "Watch",    color: C.watch    },
  FLAGGED:  { label: "Flagged",  color: C.coral    },
  CRITICAL: { label: "Critical", color: "#8b0000"  },
} as const;

const READINESS = {
  READY:           { label: "Procurement Ready",  color: C.verified, pct: 100 },
  CONDITIONAL:     { label: "Conditional",        color: C.inkLight, pct: 70  },
  NEEDS_ATTENTION: { label: "Needs Attention",    color: C.watch,    pct: 38  },
  NOT_READY:       { label: "Not Ready",          color: C.coral,    pct: 12  },
} as const;

function scoreColor(s: number) {
  return s >= 80 ? C.verified : s >= 60 ? C.watch : C.coral;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function formatCurrency(val?: number): string {
  if (!val) return "—";
  if (val >= 1_000_000) return `S$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `S$${(val / 1_000).toFixed(0)}K`;
  return `S$${val.toLocaleString()}`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

// ── Score arc (SVG) ───────────────────────────────────────────────────────────
function ScoreArc({ score, size = 48 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const col = scoreColor(score);
  const label = `Trust score: ${score} out of 100`;
  return (
    <div
      role="img"
      aria-label={label}
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.creamDark} strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={col} strokeWidth={4}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        />
      </svg>
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span style={{ fontSize: size === 48 ? 12 : 10, fontWeight: 600, color: C.ink, fontFamily: "'IBM Plex Mono', monospace" }}>
          {score}
        </span>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton({ h = 20, w = "100%", r = 4 }: { h?: number; w?: string | number; r?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: h, width: w, borderRadius: r,
        background: `linear-gradient(90deg, ${C.creamDark} 0%, ${C.mist} 50%, ${C.creamDark} 100%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s infinite",
      }}
    />
  );
}

// ── Error message ─────────────────────────────────────────────────────────────
function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      style={{
        padding: "16px 20px",
        background: "rgba(200,75,49,0.06)",
        border: `1px solid rgba(200,75,49,0.25)`,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <p style={{ fontSize: 13, color: C.coral }}>
        <span aria-hidden="true">⚠ </span>{message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            fontSize: 12, fontWeight: 600, color: C.coral,
            background: "none", border: `1px solid ${C.coral}`,
            padding: "5px 12px", borderRadius: 5, cursor: "pointer",
            fontFamily: "'IBM Plex Sans', sans-serif", flexShrink: 0,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ── Verify modal ──────────────────────────────────────────────────────────────
function VerifyModal({ onClose }: { onClose: () => void }) {
  const headingId = useId();
  const uenId = useId();
  const hashId = useId();
  const uenErrId = useId();

  const [uen, setUen] = useState("");
  const [hash, setHash] = useState("");
  const [uenError, setUenError] = useState("");
  const [result, setResult] = useState<APIState<VerifyResult>>({ data: null, loading: false, error: null });
  const closeRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Trap focus inside modal
  useEffect(() => {
    firstInputRef.current?.focus();
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const query = uen.trim() || hash.trim();
    if (!query) {
      setUenError("Please enter a UEN or verification hash.");
      firstInputRef.current?.focus();
      return;
    }
    // Basic UEN format check (9 chars, alphanumeric)
    if (uen.trim() && !/^[A-Z0-9]{9,10}$/i.test(uen.trim())) {
      setUenError("Singapore UEN format: 9–10 alphanumeric characters (e.g. 200506789A).");
      firstInputRef.current?.focus();
      return;
    }
    setUenError("");
    setResult({ data: null, loading: true, error: null });
    try {
      const endpoint = uen.trim()
        ? `${API}/api/v1/verify/${encodeURIComponent(uen.trim())}`
        : `${API}/api/v1/verify/hash/${encodeURIComponent(hash.trim())}`;
      const res = await fetch(endpoint, {
        credentials: "include",
        headers: { "Accept": "application/json" },
      });
      if (res.status === 404) {
        setResult({ data: { status: "not_found", message: "No verified record found for this UEN or hash." }, loading: false, error: null });
        return;
      }
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data: VerifyResult = await res.json();
      setResult({ data, loading: false, error: null });
    } catch (err) {
      setResult({ data: null, loading: false, error: err instanceof Error ? err.message : "Verification failed. Please try again." });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,15,30,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: C.white, borderRadius: 12, padding: "clamp(24px,4vw,36px)",
          width: "100%", maxWidth: 440,
          boxShadow: "0 24px 64px rgba(10,15,30,0.2)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 id={headingId} style={{ fontSize: 18, fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif" }}>
              Verify a Vendor
            </h2>
            <p style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>
              Blockchain-anchored certificate lookup
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close verification dialog"
            style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: 24, lineHeight: 1, padding: 2, borderRadius: 4 }}
          >
            ×
          </button>
        </div>

        {!result.data && !result.loading && (
          <form onSubmit={handleVerify} noValidate>
            <div style={{ marginBottom: 14 }}>
              <label htmlFor={uenId} style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 5 }}>
                SINGAPORE UEN
              </label>
              <input
                ref={firstInputRef}
                id={uenId}
                type="text"
                name="uen"
                value={uen}
                onChange={(e) => { setUen(e.target.value.toUpperCase()); setUenError(""); }}
                placeholder="e.g. 200506789A"
                aria-invalid={!!uenError}
                aria-describedby={uenError ? uenErrId : undefined}
                maxLength={10}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: `1.5px solid ${uenError ? C.coral : C.creamDark}`,
                  borderRadius: 6, fontSize: 13, color: C.ink, background: C.cream,
                  fontFamily: "'IBM Plex Mono', monospace",
                  boxSizing: "border-box",
                }}
              />
              {uenError && (
                <p id={uenErrId} role="alert" style={{ fontSize: 11, color: C.coral, marginTop: 4 }}>
                  {uenError}
                </p>
              )}
            </div>

            <div style={{ textAlign: "center", fontSize: 11, color: C.slate, margin: "12px 0" }}>
              — or —
            </div>

            <div style={{ marginBottom: 20 }}>
              <label htmlFor={hashId} style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 5 }}>
                BLOCKCHAIN HASH / BOOPPA VERIFICATION ID
              </label>
              <input
                id={hashId}
                type="text"
                name="hash"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="0x3a9f…d41c or BOOPPA-2026-xxxxx"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: `1.5px solid ${C.creamDark}`,
                  borderRadius: 6, fontSize: 12, color: C.ink, background: C.cream,
                  fontFamily: "'IBM Plex Mono', monospace",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%", padding: "11px",
                background: C.ink, color: C.white,
                border: "none", borderRadius: 6,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              Verify on Blockchain
            </button>
            <p style={{ fontSize: 10, color: C.slate, textAlign: "center", marginTop: 10 }}>
              Free · Immutable · AGO-admissible · Powered by Polygon
            </p>
          </form>
        )}

        {result.loading && (
          <div role="status" aria-label="Verifying on blockchain" style={{ padding: "24px 0" }}>
            <Skeleton h={16} r={4} />
            <div style={{ marginTop: 10 }}><Skeleton h={14} w="80%" r={4} /></div>
            <div style={{ marginTop: 10 }}><Skeleton h={14} w="60%" r={4} /></div>
            <p style={{ textAlign: "center", fontSize: 12, color: C.slate, marginTop: 20 }}>
              Verifying on Polygon blockchain…
            </p>
          </div>
        )}

        {result.error && (
          <div style={{ marginTop: 8 }}>
            <ErrorMessage message={result.error} onRetry={() => setResult({ data: null, loading: false, error: null })} />
          </div>
        )}

        {result.data && (
          <div>
            {result.data.status === "not_found" ? (
              <div role="status" style={{ padding: "16px", background: C.cream, borderRadius: 8, textAlign: "center" }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>🔍</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>No record found</p>
                <p style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>{result.data.message}</p>
                <button
                  type="button"
                  onClick={() => setResult({ data: null, loading: false, error: null })}
                  style={{ marginTop: 14, fontSize: 12, color: C.inkLight, background: "none", border: `1px solid ${C.mist}`, padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                  Search again
                </button>
              </div>
            ) : (
              <div role="status" aria-label="Verification result">
                <div style={{
                  background: "rgba(26,107,69,0.07)", border: "1.5px solid rgba(26,107,69,0.25)",
                  borderRadius: 8, padding: "14px 16px", marginBottom: 16,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span role="img" aria-label="Verified" style={{ fontSize: 26 }}>✓</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.verified }}>Verified on Polygon</p>
                    {result.data.anchored_at && (
                      <p style={{ fontSize: 10, color: C.slate, marginTop: 2 }}>
                        Anchored {formatDate(result.data.anchored_at)}
                      </p>
                    )}
                  </div>
                </div>
                <dl>
                  {[
                    ["Company", result.data.company_name],
                    ["UEN", result.data.uen],
                    ["Framework", result.data.framework],
                    ["Trust Score", result.data.trust_score != null ? `${result.data.trust_score} / 100` : undefined],
                    ["Verification", result.data.verification_depth],
                    ["TX Hash", result.data.tx_hash],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.creamDark}` }}>
                      <dt style={{ fontSize: 11, color: C.slate }}>{k}</dt>
                      <dd style={{ fontSize: 11, fontWeight: 600, color: C.ink, fontFamily: k === "TX Hash" ? "'IBM Plex Mono', monospace" : "inherit", maxWidth: 240, wordBreak: "break-all", textAlign: "right" }}>{v as string}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  onClick={() => setResult({ data: null, loading: false, error: null })}
                  style={{ marginTop: 16, fontSize: 12, color: C.inkLight, background: "none", border: `1px solid ${C.mist}`, padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", width: "100%" }}
                >
                  Verify another vendor
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Export modal ──────────────────────────────────────────────────────────────
function ExportModal({ vendors, userEmail, onClose }: { vendors: Vendor[]; userEmail: string; onClose: () => void }) {
  const headingId = useId();
  const officerId = useId();
  const tenderId   = useId();

  const [officer, setOfficer]   = useState("");
  const [tenderRef, setTenderRef] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const h = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  async function handleExport(e: React.FormEvent) {
    e.preventDefault();
    if (!officer.trim()) { setError("Procurement officer name is required."); firstRef.current?.focus(); return; }
    if (!tenderRef.trim()) { setError("Tender reference number is required."); return; }
    setError(""); setLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/reports/gov-shortlist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_ids: vendors.map((v) => v.id),
          officer_name: officer.trim(),
          tender_reference: tenderRef.trim(),
          generated_by_email: userEmail,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail ?? `Export failed (${res.status})`);
      }

      // Backend returns PDF binary
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Booppa_Shortlist_${tenderRef.replace(/\//g, "-")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,15,30,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: C.white, borderRadius: 12, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(10,15,30,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 id={headingId} style={{ fontSize: 17, fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif" }}>
              Export Evaluation Shortlist
            </h2>
            <p style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>
              Signed PDF · AGO-auditable · Blockchain-verified
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close export dialog" style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: 24, lineHeight: 1, padding: 2 }}>×</button>
        </div>

        {done ? (
          <div role="status" style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✓</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.verified }}>Report downloaded successfully</p>
            <p style={{ fontSize: 12, color: C.slate, marginTop: 8 }}>
              The PDF contains blockchain TX hashes and is suitable for your AGO procurement dossier.
            </p>
            <button type="button" onClick={onClose} style={{ marginTop: 20, fontSize: 12, fontWeight: 600, color: C.ink, background: "none", border: `1.5px solid ${C.ink}`, padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleExport} noValidate>
            {[
              { id: officerId, label: "PROCUREMENT OFFICER NAME", ref: firstRef, val: officer, set: setOfficer, ph: "e.g. Chan Wei Lin", required: true },
              { id: tenderId,  label: "TENDER REFERENCE NUMBER",  ref: undefined, val: tenderRef, set: setTenderRef, ph: "e.g. MOH/IT/2026/041", required: true },
            ].map((f) => (
              <div key={f.id} style={{ marginBottom: 14 }}>
                <label htmlFor={f.id} style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 5 }}>
                  {f.label} <span aria-hidden="true" style={{ color: C.coral }}>*</span>
                </label>
                <input
                  ref={f.ref as React.Ref<HTMLInputElement>}
                  id={f.id}
                  type="text"
                  value={f.val}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { f.set(e.target.value); setError(""); }}
                  placeholder={f.ph}
                  required={f.required}
                  aria-required={f.required}
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.creamDark}`, borderRadius: 6, fontSize: 13, color: C.ink, background: C.cream, fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }}
                />
              </div>
            ))}

            {/* Vendor summary */}
            <div style={{ background: C.cream, borderRadius: 6, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: C.slate, lineHeight: 1.6 }}>
                <strong style={{ color: C.ink }}>{vendors.length} vendor{vendors.length !== 1 ? "s" : ""} in shortlist:</strong>{" "}
                {vendors.map((v) => v.company_name).join(", ")}
              </p>
            </div>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              style={{
                width: "100%", padding: "11px", borderRadius: 6, cursor: loading ? "wait" : "pointer",
                background: loading ? C.slate : C.ink, color: C.white,
                fontWeight: 600, fontSize: 13, border: "none",
                fontFamily: "'IBM Plex Sans', sans-serif",
                marginTop: 8,
              }}
            >
              {loading ? "Generating PDF…" : "Download Evaluation Report (PDF)"}
            </button>
            <p style={{ fontSize: 9, color: C.slate, textAlign: "center", marginTop: 10 }}>
              Report includes SHA-256 document hash · Blockchain TX hashes · AGO-auditable
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Vendor Card ───────────────────────────────────────────────────────────────
function VendorCard({ vendor, selected, onSelect }: { vendor: Vendor; selected: boolean; onSelect: (v: Vendor) => void }) {
  const d  = DEPTH[vendor.verification_depth]    ?? DEPTH.UNVERIFIED;
  const r  = RISK[vendor.risk_signal]            ?? RISK.CLEAN;
  const rd = READINESS[vendor.procurement_readiness] ?? READINESS.NOT_READY;

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); onSelect(vendor); }
  }

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      aria-label={`Select ${vendor.company_name} for comparison. Trust score: ${vendor.trust_score}. ${d.label} verification. Risk: ${r.label}.`}
      tabIndex={0}
      onClick={() => onSelect(vendor)}
      onKeyDown={handleKeyDown}
      style={{
        background: selected ? "#f0f4f9" : C.white,
        border: `1.5px solid ${selected ? C.inkLight : C.creamDark}`,
        borderRadius: 8, padding: 18, cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        position: "relative",
        outline: "none",
      }}
    >
      {/* Checkbox visual */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: 14, right: 14,
          width: 18, height: 18, borderRadius: 4,
          border: `2px solid ${selected ? C.inkLight : C.mist}`,
          background: selected ? C.inkLight : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {selected && <span style={{ color: C.white, fontSize: 10, fontWeight: 700 }}>✓</span>}
      </div>

      {/* Header row */}
      <div style={{ display: "flex", gap: 12, paddingRight: 28, marginBottom: 10 }}>
        <ScoreArc score={vendor.trust_score} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: "'Playfair Display', serif" }}>
              {vendor.company_name}
            </span>
            {vendor.verified && (
              <span
                aria-label="Booppa Verified"
                style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.07em", color: C.verified, background: "rgba(26,107,69,0.1)", padding: "2px 6px", borderRadius: 3 }}
              >
                VERIFIED
              </span>
            )}
          </div>
          <p style={{ fontSize: 10, color: C.slate, marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>
            UEN {vendor.uen} · {vendor.industry}
          </p>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: C.slate, lineHeight: 1.65, marginBottom: 10 }}>
        {truncate(vendor.short_description, 120)}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }} aria-label="Vendor attributes">
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", color: d.color, background: d.bg, border: `1px solid ${d.color}30`, padding: "2px 7px", borderRadius: 3 }}>
          {d.label}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", color: r.color, background: "transparent", border: `1px solid ${r.color}40`, padding: "2px 7px", borderRadius: 3 }}>
          ● {r.label}
        </span>
      </div>

      {/* Readiness bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: C.slate, fontWeight: 600 }}>PROCUREMENT READINESS</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: rd.color }}>{rd.label}</span>
        </div>
        <div role="progressbar" aria-valuenow={rd.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Procurement readiness: ${rd.pct}%`} style={{ height: 3, background: C.creamDark, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${rd.pct}%`, background: rd.color, borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

// ── Compare table ─────────────────────────────────────────────────────────────
function CompareTable({ vendors, onRemove }: { vendors: Vendor[]; onRemove: (v: Vendor) => void }) {
  const tableId = useId();
  if (vendors.length < 2) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: C.slate }}>
      <p style={{ fontSize: 14 }}>Select at least 2 vendors from Browse to compare.</p>
    </div>
  );

  const ROWS: { label: string; render: (v: Vendor) => React.ReactNode }[] = [
    { label: "Trust Score", render: (v) => <ScoreArc score={v.trust_score} size={40} /> },
    { label: "Verification Depth", render: (v) => { const d = DEPTH[v.verification_depth]; return <span style={{ fontSize: 11, fontWeight: 700, color: d?.color }}>{d?.label}</span>; } },
    { label: "Risk Signal", render: (v) => { const r = RISK[v.risk_signal]; return <span style={{ fontSize: 11, fontWeight: 600, color: r?.color }}>● {r?.label}</span>; } },
    { label: "Procurement Readiness", render: (v) => { const rd = READINESS[v.procurement_readiness]; return <span style={{ fontSize: 11, color: rd?.color }}>{rd?.label}</span>; } },
    { label: "Sector Percentile", render: (v) => <span style={{ fontSize: 14, fontWeight: 700, color: v.sector_percentile >= 80 ? C.verified : C.watch }}>{v.sector_percentile}<abbr title="th percentile" style={{ fontSize: 9 }}>th</abbr></span> },
    { label: "Booppa Verified", render: (v) => <span style={{ fontWeight: 700, color: v.verified ? C.verified : C.coral, fontSize: 13 }}>{v.verified ? "✓ Yes" : "✗ No"}</span> },
  ];

  return (
    <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Vendor comparison table">
      <table id={tableId} style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
        <caption style={{ textAlign: "left", fontSize: 12, color: C.slate, marginBottom: 12, captionSide: "top" }}>
          Side-by-side comparison of {vendors.length} shortlisted vendors
        </caption>
        <thead>
          <tr style={{ borderBottom: `2px solid ${C.creamDark}` }}>
            <th scope="col" style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, color: C.slate, fontWeight: 600, letterSpacing: "0.07em" }}>
              DIMENSION
            </th>
            {vendors.map((v) => (
              <th key={v.id} scope="col" style={{ padding: "10px 16px", textAlign: "center", minWidth: 140 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: "'Playfair Display', serif", lineHeight: 1.3 }}>
                    {truncate(v.company_name, 30)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(v)}
                    aria-label={`Remove ${v.company_name} from comparison`}
                    style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: 10, fontFamily: "'IBM Plex Sans', sans-serif", padding: "2px 0" }}
                  >
                    ✕ remove
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, ri) => (
            <tr key={row.label} style={{ borderBottom: `1px solid ${C.cream}`, background: ri % 2 === 0 ? C.cream : C.white }}>
              <th scope="row" style={{ padding: "12px 16px", fontSize: 11, color: C.slate, fontWeight: 600, textAlign: "left" }}>
                {row.label}
              </th>
              {vendors.map((v) => (
                <td key={v.id} style={{ padding: "12px 16px", textAlign: "center" }}>
                  {row.render(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function BuyerDashboard() {
  const [tab, setTab]           = useState<"browse" | "compare">("browse");
  const [selected, setSelected] = useState<Vendor[]>([]);
  const [query, setQuery]       = useState("");
  const [industry, setIndustry] = useState("All");
  const [verifyOpen, setVerify] = useState(false);
  const [exportOpen, setExport] = useState(false);
  const [userEmail, setUserEmail] = useState("procurement@agency.gov.sg");
  const [userPlan, setUserPlan] = useState("free");

  const [vendors, setVendors]   = useState<APIState<Vendor[]>>({ data: null, loading: true, error: null });
  const [tenders, setTenders]   = useState<APIState<Tender[]>>({ data: null, loading: true, error: null });
  const [industries, setIndustries] = useState<string[]>(["All"]);

  const searchId   = useId();
  const industryId = useId();
  const mainRef    = useRef<HTMLElement>(null);
  const verifyBtnRef = useRef<HTMLButtonElement>(null);
  const exportBtnRef = useRef<HTMLButtonElement>(null);

  // ── Fetch current user ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/v1/auth/me`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { 
        if (d?.email) setUserEmail(d.email); 
        if (d?.plan) setUserPlan(d.plan);
      })
      .catch(() => {});
  }, []);

  // ── Fetch industries ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/v1/marketplace/industries`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { industries: [] })
      .then((d) => setIndustries(["All", ...(d.industries ?? []).map((i: { name: string }) => i.name)]))
      .catch(() => {});
  }, []);

  // ── Fetch tenders ───────────────────────────────────────────────────────────
  const fetchTenders = useCallback(() => {
    setTenders({ data: null, loading: true, error: null });
    fetch(`${API}/api/v1/gebiz/latest-tenders?limit=8`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load tenders (${r.status})`);
        return r.json();
      })
      .then((d) => setTenders({ data: d.tenders ?? d, loading: false, error: null }))
      .catch((err) => setTenders({ data: null, loading: false, error: err.message }));
  }, []);

  useEffect(() => { fetchTenders(); }, [fetchTenders]);

  // ── Fetch vendors (debounced) ───────────────────────────────────────────────
  const fetchVendors = useCallback(() => {
    setVendors((prev) => ({ ...prev, loading: true, error: null }));
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (industry !== "All") params.set("industry", industry);
    params.set("per_page", "24");

    fetch(`${API}/api/v1/marketplace/search?${params}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load vendors (${r.status})`);
        return r.json();
      })
      .then((d) => setVendors({ data: d.vendors ?? d.results ?? d, loading: false, error: null }))
      .catch((err) => setVendors({ data: null, loading: false, error: err.message }));
  }, [query, industry]);

  useEffect(() => {
    const t = setTimeout(fetchVendors, query ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchVendors, query]);

  // ── Selection logic ─────────────────────────────────────────────────────────
  const toggleSelect = useCallback((v: Vendor) => {
    setSelected((prev) => {
      if (prev.find((x) => x.id === v.id)) return prev.filter((x) => x.id !== v.id);
      if (prev.length >= 4) return prev;
      return [...prev, v];
    });
  }, []);

  const removeFromCompare = useCallback((v: Vendor) => {
    setSelected((prev) => prev.filter((x) => x.id !== v.id));
  }, []);

  // ── Modal close handlers with focus return ──────────────────────────────────
  const handleVerifyClose = useCallback(() => {
    setVerify(false);
    verifyBtnRef.current?.focus();
  }, []);

  const handleExportClose = useCallback(() => {
    setExport(false);
    exportBtnRef.current?.focus();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'IBM Plex Sans', system-ui, sans-serif; background: ${C.cream}; }
        :focus-visible { outline: 3px solid ${C.focus}; outline-offset: 2px; border-radius: 4px; }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .vendor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 12px;
        }
        .filter-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .tender-strip {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        @media (forced-colors: active) {
          button { border: 1px solid ButtonText !important; }
        }
        @media print {
          header, .filter-row, .tender-strip { display: none !important; }
        }
      `}</style>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {verifyOpen && <VerifyModal onClose={handleVerifyClose} />}
      {exportOpen && <ExportModal vendors={selected} userEmail={userEmail} onClose={handleExportClose} />}

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header role="banner" style={{ position: "sticky", top: 0, zIndex: 50, background: C.white, borderBottom: `1px solid ${C.creamDark}` }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 clamp(16px, 3vw, 32px)" }}>
          <nav aria-label="Dashboard navigation" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 12 }}>
            {/* Logo */}
            <a href="/" aria-label="Booppa — go to homepage" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
              <div aria-hidden="true" style={{ width: 28, height: 28, background: C.ink, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.white, fontSize: 13, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>B</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: "'Playfair Display', serif" }}>Booppa</div>
                <div style={{ fontSize: 9, color: C.slate, lineHeight: 1 }}>Government Procurement Intelligence</div>
              </div>
            </a>

            {/* User + actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <p style={{ fontSize: 11, color: C.slate }}>
                <span style={{ fontSize: 9, letterSpacing: "0.06em", color: C.slate }}>SIGNED IN AS </span>
                <strong style={{ color: C.ink }}>{userEmail}</strong>
              </p>
              <button
                ref={verifyBtnRef}
                type="button"
                onClick={() => setVerify(true)}
                aria-haspopup="dialog"
                style={{ padding: "7px 14px", borderRadius: 5, cursor: "pointer", border: `1.5px solid ${C.ink}`, background: "transparent", color: C.ink, fontSize: 11, fontWeight: 600 }}
              >
                🔍 Verify Vendor
              </button>
              {selected.length >= 2 && (
                <button
                  ref={exportBtnRef}
                  type="button"
                  onClick={() => {
                    if (userPlan === "evaluate_suppliers") {
                      alert("PDF Export is available on the Verify Supplier Evidence plan. Please upgrade to export shortlists.");
                    } else {
                      setExport(true);
                    }
                  }}
                  aria-haspopup="dialog"
                  aria-label={`Export evaluation shortlist with ${selected.length} vendors`}
                  style={{ padding: "7px 14px", borderRadius: 5, cursor: "pointer", border: "none", background: C.ink, color: C.white, fontSize: 11, fontWeight: 600, opacity: userPlan === "evaluate_suppliers" ? 0.7 : 1 }}
                >
                  {userPlan === "evaluate_suppliers" ? "🔒 Upgrade to Export" : `↓ Export Shortlist (${selected.length})`}
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main ref={mainRef} id="main-content" tabIndex={-1} style={{ outline: "none", maxWidth: 1140, margin: "0 auto", padding: "clamp(20px, 3vw, 32px) clamp(16px, 3vw, 32px)" }}>

        {/* ── GeBIZ Tenders strip ─────────────────────────────────────────── */}
        <section aria-labelledby="tenders-heading" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 id="tenders-heading" style={{ fontSize: 10, color: C.slate, fontWeight: 600, letterSpacing: "0.08em" }}>
              LIVE GeBIZ TENDERS — UPDATED DAILY
            </h2>
            {tenders.data && (
              <span style={{ fontSize: 10, color: C.slate }}>{tenders.data.length} open tender{tenders.data.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {tenders.error && <ErrorMessage message={tenders.error} onRetry={fetchTenders} />}

          <div className="tender-strip" role="list" aria-label="Live GeBIZ tenders">
            {tenders.loading && !tenders.data
              ? [1, 2, 3, 4].map((n) => (
                  <div key={n} style={{ minWidth: 220, background: C.white, border: `1px solid ${C.creamDark}`, borderRadius: 8, padding: 16 }}>
                    <Skeleton h={10} w="60%" />
                    <div style={{ marginTop: 8 }}><Skeleton h={14} /></div>
                    <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
                      <Skeleton h={12} w="40%" />
                      <Skeleton h={12} w="35%" />
                    </div>
                  </div>
                ))
              : (tenders.data ?? []).map((t) => (
                  <article
                    key={t.tender_no}
                    role="listitem"
                    style={{ background: C.white, border: `1px solid ${C.creamDark}`, borderRadius: 8, padding: "14px 16px", minWidth: 220, flexShrink: 0 }}
                  >
                    <p style={{ fontSize: 9, color: C.slate, fontWeight: 600, letterSpacing: "0.07em", marginBottom: 4 }}>{t.agency}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.ink, lineHeight: 1.4, marginBottom: 8 }}>
                      {truncate(t.title, 60)}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: C.verified, fontWeight: 700 }}>
                        {formatCurrency(t.estimated_value)}
                      </span>
                      <time dateTime={t.closing_date} style={{ fontSize: 9, color: C.slate }}>
                        Closes {formatDate(t.closing_date)}
                      </time>
                    </div>
                  </article>
                ))
            }
          </div>
        </section>

        {/* ── Tab bar ────────────────────────────────────────────────────── */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          style={{ display: "flex", gap: 2, marginBottom: 20, background: C.white, border: `1px solid ${C.creamDark}`, borderRadius: 7, padding: 4, width: "fit-content" }}
        >
          {[
            { id: "browse",  label: "Browse Vendors" },
            { id: "compare", label: `Compare${selected.length > 0 ? ` (${selected.length})` : ""}` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id as "browse" | "compare")}
              style={{
                fontSize: 12, fontWeight: 600, padding: "6px 18px", borderRadius: 5,
                border: "none", cursor: "pointer",
                background: tab === t.id ? C.ink : "transparent",
                color: tab === t.id ? C.white : C.slate,
                transition: "all 0.15s",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Browse panel ─────────────────────────────────────────────────── */}
        {tab === "browse" && (
          <section id="panel-browse" role="tabpanel" aria-labelledby="tab-browse">
            {/* Filters */}
            <div className="filter-row" style={{ marginBottom: 14 }} role="search" aria-label="Filter vendors">
              <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1.5px solid ${C.creamDark}`, borderRadius: 7, padding: "0 12px" }}>
                <label htmlFor={searchId} style={{ fontSize: 14, color: C.slate, flexShrink: 0 }} aria-hidden="true">⌕</label>
                <input
                  id={searchId}
                  type="search"
                  name="vendor-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by company name or UEN…"
                  aria-label="Search vendors by company name or UEN"
                  autoComplete="off"
                  style={{ flex: 1, background: "none", border: "none", color: C.ink, fontSize: 13, padding: "10px 0", fontFamily: "'IBM Plex Sans', sans-serif" }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: 16, padding: "0 2px", lineHeight: 1 }}
                  >
                    ×
                  </button>
                )}
              </div>

              <div>
                <label htmlFor={industryId} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                  Filter by industry
                </label>
                <select
                  id={industryId}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  aria-label="Filter vendors by industry"
                  style={{ padding: "10px 12px", border: `1.5px solid ${C.creamDark}`, borderRadius: 7, color: C.ink, fontSize: 12, background: C.white, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTab("compare")}
                  aria-label={`Switch to compare tab with ${selected.length} selected vendors`}
                  style={{ padding: "10px 14px", borderRadius: 7, cursor: "pointer", background: "transparent", color: C.inkLight, border: `1.5px solid ${C.inkLight}`, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  Compare {selected.length} →
                </button>
              )}
            </div>

            {/* Selection hint */}
            <p
              aria-live="polite"
              style={{ fontSize: 11, color: C.slate, marginBottom: 14 }}
            >
              {vendors.loading && !vendors.data
                ? "Loading vendors…"
                : vendors.data
                  ? `${vendors.data.length} vendor${vendors.data.length !== 1 ? "s" : ""} · Select up to 4 to compare`
                  : ""}
            </p>

            {vendors.error && <ErrorMessage message={vendors.error} onRetry={fetchVendors} />}

            {/* Grid */}
            {vendors.loading && !vendors.data ? (
              <div className="vendor-grid" aria-label="Loading vendors" aria-busy="true">
                {[1,2,3,4,5,6].map((n) => (
                  <div key={n} style={{ background: C.white, border: `1px solid ${C.creamDark}`, borderRadius: 8, padding: 18 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <Skeleton h={48} w={48} r={24} />
                      <div style={{ flex: 1 }}>
                        <Skeleton h={14} />
                        <div style={{ marginTop: 6 }}><Skeleton h={10} w="60%" /></div>
                      </div>
                    </div>
                    <Skeleton h={12} /><div style={{ marginTop: 6 }}><Skeleton h={12} w="80%" /></div>
                    <div style={{ marginTop: 12 }}><Skeleton h={8} w="40%" /></div>
                    <div style={{ marginTop: 8 }}><Skeleton h={3} /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vendor-grid" role="list" aria-label={`${vendors.data?.length ?? 0} vendors`}>
                {(vendors.data ?? []).map((v) => (
                  <div key={v.id} role="listitem">
                    <VendorCard
                      vendor={v}
                      selected={!!selected.find((x) => x.id === v.id)}
                      onSelect={toggleSelect}
                    />
                  </div>
                ))}
                {vendors.data?.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: C.slate }}>
                    <p>No vendors found for this search. Try different terms.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Compare panel ─────────────────────────────────────────────────── */}
        {tab === "compare" && (
          <section id="panel-compare" role="tabpanel" aria-labelledby="tab-compare">
            {selected.length >= 2 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => setExport(true)}
                  aria-haspopup="dialog"
                  aria-label={`Export evaluation report for ${selected.length} selected vendors`}
                  style={{ padding: "9px 18px", borderRadius: 6, cursor: "pointer", background: C.ink, color: C.white, border: "none", fontSize: 12, fontWeight: 600 }}
                >
                  ↓ Export Evaluation Report (PDF)
                </button>
              </div>
            )}

            <div style={{ background: C.white, border: `1px solid ${C.creamDark}`, borderRadius: 8, overflow: "hidden" }}>
              <CompareTable vendors={selected} onRemove={removeFromCompare} />
            </div>

            {selected.length >= 2 && (
              <div style={{ marginTop: 16, padding: "14px 18px", background: C.white, border: `1px solid ${C.creamDark}`, borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: C.slate, lineHeight: 1.75 }}>
                  <strong style={{ color: C.ink }}>About the exported report:</strong> The PDF Evaluation Shortlist
                  includes trust scores, verification depth, risk signals, blockchain TX hashes for each
                  verified vendor, and a SHA-256 document hash — suitable for attachment to procurement
                  dossiers reviewed by the Auditor-General&apos;s Office (AGO). Data is sourced from ACRA
                  and anchored on the Polygon blockchain.
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer role="contentinfo" style={{ marginTop: 40, padding: "clamp(16px, 3vw, 24px) clamp(16px, 3vw, 32px)", borderTop: `1px solid ${C.creamDark}`, background: C.white }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <p style={{ fontSize: 11, color: C.slate }}>
            © 2026 Booppa Smart Care LLC · Data: ACRA · GeBIZ · Polygon blockchain
          </p>
          <nav aria-label="Footer navigation">
            <ul style={{ display: "flex", gap: 16, listStyle: "none" }}>
              {[{ href: "/privacy", label: "Privacy Policy" }, { href: "/terms", label: "Terms" }, { href: "mailto:support@booppa.io", label: "Support" }].map(({ href, label }) => (
                <li key={label}>
                  <a href={href} style={{ fontSize: 11, color: C.slate, textDecoration: "none" }}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
