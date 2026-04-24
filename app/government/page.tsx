"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE ?? "https://api.booppa.io";

// ── Colour tokens ────────────────────────────────────────────────────────────
const T = {
  ink:       "#0a0f1e",
  inkMid:    "#1e2a45",
  inkLight:  "#2d3f6b",
  coral:     "#c84b31",
  gold:      "#b8962e",
  cream:     "#f7f4ee",
  creamDark: "#ede8de",
  mist:      "#d4dde8",
  slate:     "#6b7a99",
  white:     "#ffffff",
  verified:  "#1a6b45",
  watch:     "#8a5c00",
  clean:     "#1a4d6b",
} as const;

// ── Types ────────────────────────────────────────────────────────────────────
type DepthKey    = "CERTIFIED" | "DEEP" | "STANDARD" | "BASIC" | "UNVERIFIED";
type RiskKey     = "CLEAN" | "WATCH" | "FLAGGED";
type ReadinessKey= "READY" | "CONDITIONAL" | "NEEDS_ATTENTION";

interface Vendor {
  id:          string;
  name:        string;
  uen:         string;
  industry:    string;
  trust_score: number;
  depth:       DepthKey;
  risk:        RiskKey;
  readiness:   ReadinessKey;
  percentile:  number | null;
  description: string;
  verified:    boolean;
  website:     string;
}

interface Tender {
  agency:  string;
  ref:     string;
  title:   string;
  value:   string;
  closing: string;
  url:     string | null;
}

interface VerifyResult {
  verified:    boolean;
  company:     string | null;
  uen:         string | null;
  framework:   string | null;
  trust_score: number | null;
  depth:       string | null;
  tx_hash:     string | null;
  anchored_at: string | null;
  error:       string | null;
}

// ── Config maps ──────────────────────────────────────────────────────────────
const DEPTH_CFG: Record<DepthKey, { label: string; color: string; bg: string }> = {
  CERTIFIED:  { label: "Certified",   color: T.verified,  bg: "rgba(26,107,69,0.1)" },
  DEEP:       { label: "Deep",        color: "#1a4d6b",   bg: "rgba(26,77,107,0.1)" },
  STANDARD:   { label: "Standard",    color: T.inkLight,  bg: "rgba(45,63,107,0.1)" },
  BASIC:      { label: "Basic",       color: T.gold,      bg: "rgba(184,150,46,0.1)" },
  UNVERIFIED: { label: "Unverified",  color: T.slate,     bg: "rgba(107,122,153,0.1)" },
};
const RISK_CFG: Record<RiskKey, { label: string; color: string }> = {
  CLEAN:   { label: "Clean",   color: T.verified },
  WATCH:   { label: "Watch",   color: T.watch },
  FLAGGED: { label: "Flagged", color: T.coral },
};
const READY_CFG: Record<ReadinessKey, { label: string; color: string; pct: number }> = {
  READY:           { label: "Procurement Ready", color: T.verified, pct: 100 },
  CONDITIONAL:     { label: "Conditional",       color: T.clean,   pct: 70  },
  NEEDS_ATTENTION: { label: "Needs Attention",   color: T.watch,   pct: 38  },
};

function scoreColor(s: number) {
  return s >= 80 ? T.verified : s >= 60 ? T.watch : T.coral;
}

const INDUSTRIES = [
  "All",
  "IT & Systems Integration",
  "Cybersecurity",
  "Data & Analytics",
  "IT & Cloud Services",
  "Digital Government",
  "Healthcare Technology",
];

// ── ScoreArc ─────────────────────────────────────────────────────────────────
function ScoreArc({ score, size = 48 }: { score: number; size?: number }) {
  const r    = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const col  = scoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.creamDark} strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={4}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size === 48 ? 12 : 10, fontWeight: 600, color: T.ink }}>
          {score}
        </span>
      </div>
    </div>
  );
}

// ── VendorCard ────────────────────────────────────────────────────────────────
function VendorCard({
  v, selected, onSelect,
}: { v: Vendor; selected: boolean; onSelect: (v: Vendor) => void }) {
  const d  = DEPTH_CFG[v.depth]   ?? DEPTH_CFG.UNVERIFIED;
  const r  = RISK_CFG[v.risk]     ?? RISK_CFG.CLEAN;
  const rd = READY_CFG[v.readiness] ?? READY_CFG.NEEDS_ATTENTION;
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   selected ? "#f0f4f9" : hov ? "#f7f9fb" : T.white,
        border:       `1.5px solid ${selected ? T.inkLight : hov ? T.mist : T.creamDark}`,
        borderRadius: 8, padding: 18, cursor: "default",
        transition:   "all 0.18s", position: "relative",
      }}
    >
      {/* Checkbox */}
      <div
        onClick={() => onSelect(v)}
        style={{
          position: "absolute", top: 14, right: 14,
          width: 18, height: 18, borderRadius: 4,
          border: `2px solid ${selected ? T.inkLight : T.mist}`,
          background: selected ? T.inkLight : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.15s",
        }}
      >
        {selected && <span style={{ color: T.white, fontSize: 10, fontWeight: 700 }}>✓</span>}
      </div>

      <div style={{ display: "flex", gap: 12, paddingRight: 24, marginBottom: 10 }}>
        <ScoreArc score={v.trust_score} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{v.name}</span>
            {v.verified && (
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: "0.07em",
                color: T.verified, background: "rgba(26,107,69,0.1)",
                padding: "2px 6px", borderRadius: 3,
              }}>VERIFIED</span>
            )}
          </div>
          <p style={{ fontSize: 10, color: T.slate, marginTop: 2, fontFamily: "monospace" }}>
            UEN {v.uen} · {v.industry}
          </p>
        </div>
      </div>

      {v.description && (
        <p style={{ fontSize: 11, color: T.slate, lineHeight: 1.6, marginBottom: 10 }}>
          {v.description.slice(0, 120)}{v.description.length > 120 ? "…" : ""}
        </p>
      )}

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {[
          { label: d.label,          color: d.color, bg: d.bg },
          { label: `● ${r.label}`,   color: r.color, bg: "transparent" },
        ].map((tag, i) => (
          <span key={i} style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
            color: tag.color, background: tag.bg,
            border: `1px solid ${tag.color}30`,
            padding: "2px 7px", borderRadius: 3,
          }}>{tag.label}</span>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 9, color: T.slate, fontWeight: 600 }}>PROCUREMENT READINESS</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: rd.color }}>{rd.label}</span>
        </div>
        <div style={{ height: 3, background: T.creamDark, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${rd.pct}%`, background: rd.color, borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

// ── VerifyModal ───────────────────────────────────────────────────────────────
function VerifyModal({ onClose }: { onClose: () => void }) {
  const [uen,     setUen]     = useState("");
  const [hash,    setHash]    = useState("");
  const [step,    setStep]    = useState<"input" | "loading" | "result" | "error">("input");
  const [result,  setResult]  = useState<VerifyResult | null>(null);

  const handleVerify = async () => {
    if (!uen.trim() && !hash.trim()) return;
    setStep("loading");
    try {
      const res  = await fetch(`${API}/api/government/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ uen: uen.trim() || undefined, hash: hash.trim() || undefined }),
      });
      const data = await res.json();
      setResult(data);
      setStep(data.error && !data.verified ? "error" : "result");
    } catch {
      setStep("error");
      setResult({ verified: false, company: null, uen: null, framework: null,
        trust_score: null, depth: null, tx_hash: null, anchored_at: null,
        error: "Network error — please try again." });
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(10,15,30,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.white, borderRadius: 12, padding: 32,
        width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(10,15,30,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>Verify a Vendor</h2>
            <p style={{ fontSize: 11, color: T.slate, marginTop: 3 }}>Blockchain-anchored certificate lookup</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.slate, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {(step === "input" || step === "loading") && (
          <>
            {[
              { label: "SINGAPORE UEN",                    placeholder: "e.g. 200506789A",         value: uen,  onChange: setUen,  mono: false },
              { label: "BLOCKCHAIN HASH / VERIFICATION ID", placeholder: "0x3a9f… or BOOPPA-2026-…", value: hash, onChange: setHash, mono: true  },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 9, fontWeight: 700, color: T.slate, letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>
                  {f.label}
                </label>
                <input
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: `1.5px solid ${T.creamDark}`, borderRadius: 6,
                    fontSize: 12, color: T.ink, background: T.cream,
                    fontFamily: f.mono ? "monospace" : "inherit",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleVerify}
              disabled={step === "loading"}
              style={{
                width: "100%", padding: 11, borderRadius: 6, cursor: "pointer",
                background: T.ink, color: T.white,
                fontWeight: 600, fontSize: 13, border: "none",
                opacity: step === "loading" ? 0.7 : 1, marginTop: 4,
              }}
            >
              {step === "loading" ? "Verifying on Polygon blockchain…" : "Verify Now"}
            </button>
            <p style={{ fontSize: 10, color: T.slate, textAlign: "center", marginTop: 10 }}>
              Free · Immutable · Auditor-admissible
            </p>
          </>
        )}

        {(step === "result" || step === "error") && result && (
          <>
            <div style={{
              background: result.verified ? "rgba(26,107,69,0.07)" : "rgba(200,75,49,0.07)",
              border: `1.5px solid ${result.verified ? "rgba(26,107,69,0.2)" : "rgba(200,75,49,0.2)"}`,
              borderRadius: 8, padding: "14px 16px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 26 }}>{result.verified ? "✓" : "⚠"}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: result.verified ? T.verified : T.coral }}>
                  {result.verified ? "Verified on Polygon" : "Not Verified"}
                </p>
                <p style={{ fontSize: 10, color: T.slate }}>
                  {result.anchored_at ? `Anchored ${result.anchored_at}` : result.error ?? ""}
                </p>
              </div>
            </div>
            {[
              ["Company",     result.company],
              ["UEN",         result.uen],
              ["Framework",   result.framework],
              ["Trust Score", result.trust_score != null ? `${result.trust_score} / 100` : null],
              ["Depth",       result.depth],
              ["TX Hash",     result.tx_hash ? `${result.tx_hash.slice(0, 10)}…` : null],
            ].filter(([, v]) => v != null).map(([k, v]) => (
              <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.creamDark}` }}>
                <span style={{ fontSize: 11, color: T.slate }}>{k}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.ink, fontFamily: k === "TX Hash" ? "monospace" : "inherit" }}>{v as string}</span>
              </div>
            ))}
            <button
              onClick={() => { setStep("input"); setResult(null); setUen(""); setHash(""); }}
              style={{ marginTop: 16, width: "100%", padding: 10, borderRadius: 6, border: `1.5px solid ${T.creamDark}`, background: "transparent", cursor: "pointer", fontSize: 12, color: T.slate }}
            >
              Search again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── CompareTable ──────────────────────────────────────────────────────────────
function CompareTable({ vendors, onRemove }: { vendors: Vendor[]; onRemove: (v: Vendor) => void }) {
  if (vendors.length < 2) return (
    <div style={{ textAlign: "center", padding: "64px 32px" }}>
      <p style={{ fontSize: 32, marginBottom: 16 }}>⚖️</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
        {vendors.length === 0 ? "No vendors selected" : "Select one more vendor"}
      </p>
      <p style={{ fontSize: 12, color: T.slate, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
        {vendors.length === 0
          ? "Go to Browse and tick the checkbox on at least 2 vendors to compare them side-by-side."
          : `You have ${vendors.length} vendor selected. Tick one more from Browse to start comparing.`}
      </p>
    </div>
  );

  const ROWS: { key: keyof Vendor | string; label: string; render: (v: Vendor) => React.ReactNode }[] = [
    { key: "trust_score", label: "Trust Score",           render: v => <ScoreArc score={v.trust_score} size={40} /> },
    { key: "depth",       label: "Verification Depth",    render: v => { const d = DEPTH_CFG[v.depth] ?? DEPTH_CFG.UNVERIFIED; return <span style={{ color: d.color, fontWeight: 700, fontSize: 11 }}>{d.label}</span>; } },
    { key: "risk",        label: "Risk Signal",           render: v => { const r = RISK_CFG[v.risk] ?? RISK_CFG.CLEAN;  return <span style={{ color: r.color, fontWeight: 700, fontSize: 11 }}>{r.label}</span>; } },
    { key: "readiness",   label: "Procurement Readiness", render: v => { const rd = READY_CFG[v.readiness] ?? READY_CFG.NEEDS_ATTENTION; return <span style={{ color: rd.color, fontWeight: 700, fontSize: 11 }}>{rd.label}</span>; } },
    { key: "percentile",  label: "Sector Percentile",     render: v => <span style={{ fontSize: 11, color: T.ink }}>{v.percentile != null ? `${v.percentile}th` : "—"}</span> },
    { key: "verified",    label: "Booppa Verified",       render: v => <span style={{ fontWeight: 700, fontSize: 11, color: v.verified ? T.verified : T.slate }}>{v.verified ? "✓ Yes" : "No"}</span> },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${T.creamDark}` }}>
            <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, color: T.slate, fontWeight: 700, letterSpacing: "0.08em" }}>DIMENSION</th>
            {vendors.map(v => (
              <th key={v.id} style={{ padding: "10px 16px", textAlign: "center", minWidth: 140 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{v.name.split(" ").slice(0, 2).join(" ")}</span>
                  <button onClick={() => onRemove(v)} style={{ background: "none", border: "none", color: T.slate, cursor: "pointer", fontSize: 9 }}>✕ remove</button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, ri) => (
            <tr key={row.key} style={{ borderBottom: `1px solid ${T.cream}`, background: ri % 2 === 0 ? T.white : T.cream }}>
              <td style={{ padding: "12px 16px", fontSize: 11, color: T.slate, fontWeight: 600 }}>{row.label}</td>
              {vendors.map(v => (
                <td key={v.id} style={{ padding: "12px 16px", textAlign: "center" }}>{row.render(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Auth form (register / login) ──────────────────────────────────────────────
interface PortalStats {
  total_vendors:    number;
  verified_vendors: number;
  open_tenders:     number;
  discovered:       number;
}

function AuthForm({ onEnter }: { onEnter: (email: string) => void }) {
  const [mode,      setMode]      = useState<"login" | "register">("login");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [fullName,  setFullName]  = useState("");
  const [agency,    setAgency]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [stats,     setStats]     = useState<PortalStats | null>(null);

  useEffect(() => {
    fetch(`${API}/api/government/stats`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && typeof d.total_vendors === "number") setStats(d); })
      .catch(() => {});
  }, []);

  const submit = async () => {
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "register" ? "/api/government/register" : "/api/government/login";
      const body = mode === "register"
        ? { email, password, full_name: fullName || undefined, agency: agency || undefined }
        : { email, password };

      const res  = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail ?? "Something went wrong."); return; }

      localStorage.setItem("gov_token",    data.access_token);
      localStorage.setItem("gov_refresh",  data.refresh_token);
      localStorage.setItem("gov_email",    data.email);
      localStorage.setItem("gov_agency",   data.agency ?? "");
      onEnter(data.email);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const STATS = [
    { n: stats ? (stats.total_vendors + stats.discovered).toLocaleString() : "—", label: "Singapore vendors indexed" },
    { n: stats ? stats.verified_vendors.toLocaleString()                        : "—", label: "Booppa-verified entities" },
    { n: stats ? stats.open_tenders.toLocaleString()                            : "—", label: "Open GeBIZ tenders" },
    { n: "S$0",                                                                        label: "Cost to government agencies" },
  ];
  const AGENCIES = [
    "Ministry of Finance", "GovTech", "EDB", "JTC Corporation", "HDB",
    "Ministry of Health", "Land Transport Authority", "CPF Board",
    "IMDA", "NEA", "MOM", "CSA",
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Back link */}
      <div style={{ padding: "12px 48px", borderBottom: `1px solid ${T.creamDark}`, background: T.cream, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
          <img src="/logo.png" alt="Booppa" style={{ height: 24, width: "auto" }} />
        </a>
        <a href="/" style={{ fontSize: 11, color: T.slate, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          onMouseEnter={e => (e.currentTarget.style.color = T.ink)}
          onMouseLeave={e => (e.currentTarget.style.color = T.slate)}>
          ← Back to booppa.io
        </a>
      </div>
      {/* Hero + form */}
      <div style={{ padding: "80px 48px 64px", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
        {/* Left: copy */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${T.inkLight}30`, borderRadius: 4, padding: "5px 12px", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.coral }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: T.inkLight, letterSpacing: "0.1em" }}>SINGAPORE GOVERNMENT PROCUREMENT PROGRAMME</span>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.15, color: T.ink, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Vendor Intelligence<br />
            <span style={{ color: T.inkLight }}>for Singapore's</span><br />
            Procurement Officers
          </h1>
          <p style={{ fontSize: 15, color: T.slate, lineHeight: 1.75, marginBottom: 40, maxWidth: 480 }}>
            Verify vendor credentials, compare procurement readiness, and generate
            AGO-auditable evaluation records — at no cost to government agencies.
          </p>

          {/* Stats */}
          <div style={{ background: T.ink, borderRadius: 12, padding: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {STATS.map(s => (
              <div key={s.n}>
                <div style={{ fontSize: 26, fontWeight: 700, color: T.white }}>{s.n}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
            <div style={{ gridColumn: "1/-1", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                All data sourced from ACRA, GeBIZ, and Polygon blockchain.<br />
                Reports are AGO-auditable and include blockchain provenance.
              </p>
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div style={{ background: T.white, borderRadius: 12, padding: 36, border: `1.5px solid ${T.creamDark}`, boxShadow: "0 4px 32px rgba(10,15,30,0.06)" }}>
          {/* Toggle */}
          <div style={{ display: "flex", gap: 2, background: T.cream, borderRadius: 7, padding: 4, marginBottom: 28 }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "8px 0", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: mode === m ? T.ink : "transparent", color: mode === m ? T.white : T.slate, transition: "all 0.15s" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: T.slate, letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>EMAIL</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="officer@agency.gov.sg" onKeyDown={e => e.key === "Enter" && submit()}
              style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${T.creamDark}`, borderRadius: 6, fontSize: 12, color: T.ink, background: T.cream, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: mode === "register" ? 14 : 20 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: T.slate, letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()}
              style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${T.creamDark}`, borderRadius: 6, fontSize: 12, color: T.ink, background: T.cream, outline: "none", boxSizing: "border-box" }} />
          </div>

          {mode === "register" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 9, fontWeight: 700, color: T.slate, letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>FULL NAME <span style={{ fontWeight: 400, color: T.slate }}>(optional)</span></label>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Chan Wei Ling"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${T.creamDark}`, borderRadius: 6, fontSize: 12, color: T.ink, background: T.cream, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 9, fontWeight: 700, color: T.slate, letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>AGENCY <span style={{ fontWeight: 400, color: T.slate }}>(optional)</span></label>
                <input value={agency} onChange={e => setAgency(e.target.value)}
                  placeholder="e.g. Ministry of Finance"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${T.creamDark}`, borderRadius: 6, fontSize: 12, color: T.ink, background: T.cream, outline: "none", boxSizing: "border-box" }} />
              </div>
            </>
          )}

          {error && <p style={{ fontSize: 11, color: T.coral, marginBottom: 12 }}>{error}</p>}

          <button onClick={submit} disabled={loading}
            style={{ width: "100%", padding: 12, borderRadius: 6, border: "none", cursor: loading ? "default" : "pointer",
              background: T.ink, color: T.white, fontWeight: 600, fontSize: 13, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <p style={{ fontSize: 10, color: T.slate, textAlign: "center", marginTop: 14 }}>
            Free for all government agencies · No credit card required
          </p>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: T.white, padding: "64px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, color: T.slate, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 8 }}>WHAT PROCUREMENT OFFICERS CAN DO</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: T.ink, marginBottom: 40 }}>Three tools. One dashboard. Zero cost.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              { n: "01", title: "Verify Vendor",    desc: "Confirm any Singapore company's compliance credentials via blockchain.", tag: "Blockchain-anchored · Polygon" },
              { n: "02", title: "Browse & Filter",  desc: `Search ${stats ? (stats.total_vendors + stats.discovered).toLocaleString() : "thousands of"} Singapore vendors by industry, verification depth, and procurement readiness.`, tag: "ACRA-sourced · Real-time" },
              { n: "03", title: "Compare & Export", desc: "Select up to 4 vendors for side-by-side comparison across 6 dimensions. Export AGO-auditable shortlist.", tag: "AGO-auditable · TXT export" },
            ].map(f => (
              <div key={f.n} style={{ padding: 28, border: `1.5px solid ${T.creamDark}`, borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.slate, letterSpacing: "0.1em", marginBottom: 8 }}>{f.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: T.slate, lineHeight: 1.7, marginBottom: 14 }}>{f.desc}</p>
                <span style={{ fontSize: 9, fontWeight: 600, color: T.inkLight, letterSpacing: "0.06em", background: T.cream, padding: "3px 8px", borderRadius: 3 }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agency strip */}
      <div style={{ padding: "40px 48px", background: T.cream, borderTop: `1px solid ${T.creamDark}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 10, color: T.slate, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 16, textAlign: "center" }}>BUILT FOR PROCUREMENT TEAMS ACROSS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {AGENCIES.map(a => (
              <span key={a} style={{ fontSize: 11, color: T.inkLight, fontWeight: 500, padding: "5px 12px", border: `1px solid ${T.mist}`, borderRadius: 20, background: T.white }}>{a}</span>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ padding: "28px 48px", borderTop: `1px solid ${T.creamDark}`, background: T.cream }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 10, color: T.slate }}>© 2026 Booppa Smart Care LLC · booppa.io/government · compliance@booppa.io</p>
          <p style={{ fontSize: 10, color: T.slate }}>Data sourced from ACRA · GeBIZ · Polygon blockchain · UEN 202415732W</p>
        </div>
      </footer>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: T.white, border: `1.5px solid ${T.creamDark}`, borderRadius: 8, padding: 18 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.creamDark, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 12, background: T.creamDark, borderRadius: 4, marginBottom: 8, width: "70%" }} />
          <div style={{ height: 10, background: T.creamDark, borderRadius: 4, width: "50%" }} />
        </div>
      </div>
      <div style={{ height: 10, background: T.creamDark, borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 10, background: T.creamDark, borderRadius: 4, width: "80%", marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <div style={{ height: 18, width: 56, background: T.creamDark, borderRadius: 3 }} />
        <div style={{ height: 18, width: 44, background: T.creamDark, borderRadius: 3 }} />
      </div>
      <div style={{ height: 3, background: T.creamDark, borderRadius: 2 }} />
    </div>
  );
}

// ── Buyer Dashboard ───────────────────────────────────────────────────────────
function BuyerDashboard({ onLogout }: { onLogout: () => void }) {
  const [govEmail,  setGovEmail]  = useState("");
  const [govAgency, setGovAgency] = useState("");

  const [tab,        setTab]        = useState<"browse" | "compare">("browse");
  const [selected,   setSelected]   = useState<Vendor[]>([]);
  const [query,      setQuery]       = useState("");
  const [industry,   setIndustry]   = useState("All");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [officer,    setOfficer]    = useState("");
  const [tenderRef,  setTenderRef]  = useState("");

  const [vendors,      setVendors]      = useState<Vendor[]>([]);
  const [tenders,      setTenders]      = useState<Tender[]>([]);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(false);

  // Hydrate from localStorage safely on client
  useEffect(() => {
    const email  = localStorage.getItem("gov_email")  ?? "";
    const agency = localStorage.getItem("gov_agency") ?? "";
    setGovEmail(email);
    setGovAgency(agency);
    setOfficer(email);
  }, []);

  // Fetch tenders once on mount
  useEffect(() => {
    fetch(`${API}/api/government/tenders?limit=6`)
      .then(r => r.json())
      .then(d => setTenders(d.tenders ?? []))
      .catch(() => {});
  }, []);

  // Fetch vendors on filter/page change
  const fetchVendors = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "24" });
    if (query)                    params.set("q", query);
    if (industry && industry !== "All") params.set("industry", industry);

    fetch(`${API}/api/government/vendors?${params}`)
      .then(r => r.json())
      .then(d => {
        setVendors(d.vendors ?? []);
        setTotalVendors(d.total ?? 0);
        setTotalPages(d.pages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query, industry, page]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  // Debounce query input
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchVendors(); }, 350);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = (v: Vendor) => {
    setSelected(prev => {
      const exists = prev.find(x => x.id === v.id);
      if (exists) return prev.filter(x => x.id !== v.id);
      if (prev.length >= 4) return prev;
      return [...prev, v];
    });
  };

  const exportShortlist = async () => {
    try {
      const res = await fetch(`${API}/api/government/shortlist-report`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ vendors: selected, officer, tender_ref: tenderRef }),
      });
      const text    = await res.text();
      const blob    = new Blob([text], { type: "text/plain" });
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      const dateStr = new Date().toLocaleDateString("en-SG", { day: "2-digit", month: "long", year: "numeric" });
      a.href     = url;
      a.download = `Booppa_Shortlist_${tenderRef || "evaluation"}_${dateStr.replace(/ /g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
    } catch {
      alert("Export failed — please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} />}

      {/* Export modal */}
      {showExport && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,15,30,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setShowExport(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: 12, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(10,15,30,0.18)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Export Evaluation Shortlist</h2>
            <p style={{ fontSize: 11, color: T.slate, marginBottom: 24 }}>
              The exported document includes blockchain hashes, SHA-256 document hash, and is suitable for AGO procurement dossiers.
            </p>
            {[
              { label: "PROCUREMENT OFFICER NAME", val: officer,    set: setOfficer,   ph: "e.g. Chan Wei Ling" },
              { label: "TENDER REFERENCE NUMBER",  val: tenderRef,  set: setTenderRef, ph: "e.g. MOH/IT/2026/041" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 9, fontWeight: 700, color: T.slate, letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${T.creamDark}`, borderRadius: 6, fontSize: 12, color: T.ink, background: T.cream, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ background: T.cream, borderRadius: 6, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: T.slate }}>
                {selected.length} vendor{selected.length !== 1 ? "s" : ""} in shortlist:&nbsp;
                <strong style={{ color: T.ink }}>{selected.map(v => v.name.split(" ")[0]).join(", ")}</strong>
              </p>
            </div>
            <button onClick={exportShortlist}
              style={{ width: "100%", padding: 11, borderRadius: 6, cursor: "pointer", background: T.ink, color: T.white, fontWeight: 600, fontSize: 13, border: "none" }}>
              Download Evaluation Report
            </button>
            <p style={{ fontSize: 9, color: T.slate, textAlign: "center", marginTop: 10 }}>
              Document includes SHA-256 hash · AGO-auditable · Powered by Booppa Smart Care LLC
            </p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ padding: "14px 32px", background: T.white, borderBottom: `1px solid ${T.creamDark}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src="/logo.png" alt="Booppa" style={{ height: 26, width: "auto" }} />
          </a>
          <div>
            <span style={{ fontSize: 9, color: T.slate, display: "block", lineHeight: 1 }}>Government Procurement Intelligence</span>
          </div>
          <div style={{ width: 1, height: 28, background: T.creamDark, margin: "0 8px" }} />
          <a href="/" style={{ fontSize: 10, color: T.slate, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = T.ink)}
            onMouseLeave={e => (e.currentTarget.style.color = T.slate)}>
            ← booppa.io
          </a>
          <div style={{ width: 1, height: 28, background: T.creamDark, margin: "0 8px" }} />
          <span style={{ fontSize: 10, color: T.slate }}>
            {govAgency && <><strong style={{ color: T.ink }}>{govAgency}</strong> · </>}
            <strong style={{ color: T.ink }}>{govEmail || "procurement officer"}</strong>
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setVerifyOpen(true)} style={{ padding: "7px 14px", borderRadius: 5, cursor: "pointer", border: `1.5px solid ${T.ink}`, background: "transparent", color: T.ink, fontSize: 11, fontWeight: 600 }}>
            Verify Vendor
          </button>
          {selected.length >= 2 && (
            <button onClick={() => setShowExport(true)} style={{ padding: "7px 14px", borderRadius: 5, cursor: "pointer", border: "none", background: T.ink, color: T.white, fontSize: 11, fontWeight: 600 }}>
              ↓ Export Shortlist ({selected.length})
            </button>
          )}
          <button onClick={onLogout} style={{ padding: "7px 14px", borderRadius: 5, cursor: "pointer", border: `1.5px solid ${T.mist}`, background: "transparent", color: T.slate, fontSize: 11 }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 32px" }}>

        {/* Live tenders strip */}
        {tenders.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 10, color: T.slate, fontWeight: 600, letterSpacing: "0.08em" }}>LIVE GeBIZ TENDERS — UPDATED DAILY</p>
              <span style={{ fontSize: 10, color: T.slate }}>{tenders.length} open tenders</span>
            </div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {tenders.map(t => {
                const Wrap = t.url ? "a" : "div";
                return (
                  <Wrap key={t.ref} {...(t.url ? { href: t.url, target: "_blank", rel: "noreferrer" } : {})}
                    style={{ background: T.white, border: `1px solid ${T.creamDark}`, borderRadius: 8, padding: "14px 16px", minWidth: 220, flexShrink: 0, textDecoration: "none", display: "block",
                      borderLeft: `3px solid ${T.inkLight}`, cursor: t.url ? "pointer" : "default" }}>
                    <p style={{ fontSize: 9, color: T.slate, fontWeight: 600, letterSpacing: "0.07em", marginBottom: 4 }}>{t.agency}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: T.ink, lineHeight: 1.4, marginBottom: 8 }}>{t.title}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: T.verified, fontWeight: 700 }}>{t.value}</span>
                      <span style={{ fontSize: 9, color: T.slate }}>Closes {t.closing}</span>
                    </div>
                    {t.url && <p style={{ fontSize: 9, color: T.inkLight, marginTop: 6, fontWeight: 600 }}>View on GeBIZ →</p>}
                  </Wrap>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, background: T.white, border: `1px solid ${T.creamDark}`, borderRadius: 7, padding: 4, width: "fit-content" }}>
          {[
            { id: "browse",  label: "Browse Vendors" },
            { id: "compare", label: `Compare${selected.length > 0 ? ` (${selected.length})` : ""}` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as "browse" | "compare")}
              style={{ fontSize: 12, fontWeight: 600, padding: "6px 18px", borderRadius: 5, border: "none", cursor: "pointer", background: tab === t.id ? T.ink : "transparent", color: tab === t.id ? T.white : T.slate, transition: "all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Browse tab */}
        {tab === "browse" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, background: T.white, border: `1.5px solid ${T.creamDark}`, borderRadius: 7, padding: "0 12px" }}>
                <span style={{ color: T.slate, fontSize: 14 }}>⌕</span>
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search by company name or UEN…"
                  style={{ flex: 1, background: "none", border: "none", color: T.ink, fontSize: 12, padding: "10px 0", outline: "none" }} />
              </div>
              <select value={industry} onChange={e => { setIndustry(e.target.value); setPage(1); }}
                style={{ padding: "10px 12px", border: `1.5px solid ${T.creamDark}`, borderRadius: 7, color: T.ink, fontSize: 12, background: T.white, cursor: "pointer" }}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
              {selected.length > 0 && (
                <button onClick={() => setTab("compare")} style={{ padding: "10px 14px", borderRadius: 7, cursor: "pointer", background: "transparent", color: T.inkLight, border: `1.5px solid ${T.inkLight}`, fontSize: 12, fontWeight: 600 }}>
                  Compare {selected.length} →
                </button>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 10, color: T.slate }}>
                {loading ? "Loading…" : `${totalVendors.toLocaleString()} vendors · Select up to 4 to compare`}
              </p>
              {totalPages > 1 && (
                <p style={{ fontSize: 10, color: T.slate }}>Page {page} of {totalPages}</p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : vendors.map(v => (
                    <VendorCard key={v.id} v={v} selected={!!selected.find(x => x.id === v.id)} onSelect={toggleSelect} />
                  ))
              }
              {!loading && vendors.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "64px 0" }}>
                  <p style={{ fontSize: 28, marginBottom: 12 }}>🔍</p>
                  <p style={{ fontSize: 14, color: T.ink, fontWeight: 600, marginBottom: 6 }}>No vendors found</p>
                  <p style={{ fontSize: 12, color: T.slate }}>Try adjusting your search or industry filter.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: "7px 16px", borderRadius: 6, border: `1.5px solid ${T.creamDark}`, background: T.white, color: page === 1 ? T.mist : T.ink, fontSize: 12, cursor: page === 1 ? "default" : "pointer", fontWeight: 600 }}>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${pg === page ? T.ink : T.creamDark}`,
                        background: pg === page ? T.ink : T.white, color: pg === page ? T.white : T.slate,
                        fontSize: 12, cursor: "pointer", fontWeight: pg === page ? 700 : 400 }}>
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: "7px 16px", borderRadius: 6, border: `1.5px solid ${T.creamDark}`, background: T.white, color: page === totalPages ? T.mist : T.ink, fontSize: 12, cursor: page === totalPages ? "default" : "pointer", fontWeight: 600 }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Compare tab */}
        {tab === "compare" && (
          <div>
            {selected.length >= 2 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: T.slate }}>Comparing {selected.length} vendors — side-by-side procurement assessment</p>
                <button onClick={() => setShowExport(true)}
                  style={{ padding: "8px 16px", borderRadius: 6, cursor: "pointer", background: T.ink, color: T.white, border: "none", fontSize: 11, fontWeight: 600 }}>
                  ↓ Export Evaluation Report
                </button>
              </div>
            )}
            <div style={{ background: T.white, border: `1px solid ${T.creamDark}`, borderRadius: 8, overflow: "hidden" }}>
              <CompareTable vendors={selected} onRemove={v => setSelected(prev => prev.filter(x => x.id !== v.id))} />
            </div>
            {selected.length >= 2 && (
              <div style={{ marginTop: 16, padding: "14px 18px", background: T.white, border: `1px solid ${T.creamDark}`, borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: T.slate, lineHeight: 1.7 }}>
                  <strong style={{ color: T.ink }}>About the Export:</strong> The Evaluation Shortlist includes trust scores,
                  verification depth, risk signals, blockchain TX hashes, and a document SHA-256 hash — suitable for attachment
                  to procurement dossiers reviewed by the Auditor-General's Office.
                  All data is sourced from ACRA and anchored on the Polygon blockchain.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function GovernmentPortal() {
  const [view, setView] = useState<"auth" | "dashboard">("auth");

  // Restore session on mount
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("gov_token")) {
      setView("dashboard");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("gov_token");
    localStorage.removeItem("gov_refresh");
    localStorage.removeItem("gov_email");
    localStorage.removeItem("gov_agency");
    setView("auth");
  };

  return (
    <div suppressHydrationWarning>
      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'IBM Plex Sans', sans-serif; }
        button, input, select { font-family: 'IBM Plex Sans', sans-serif; }
        input:focus, select:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d4dde8; border-radius: 2px; }
      `}</style>
      {view === "auth"
        ? <AuthForm onEnter={() => setView("dashboard")} />
        : <BuyerDashboard onLogout={handleLogout} />
      }
    </div>
  );
}
