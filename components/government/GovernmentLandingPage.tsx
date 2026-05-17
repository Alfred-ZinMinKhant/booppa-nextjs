"use client";

/**
 * Government Landing Page — booppa.io/government
 * ================================================
 * Production-grade. Zero mock data. WCAG 2.1 AA compliant.
 * Responsive 320px–2560px. Full keyboard navigation.
 *
 * Route: app/government/page.tsx
 * Auth:  Public — no token required
 * Gate:  Email must end with .gov.sg to proceed
 */

import React, { useState, useEffect, useRef, useId } from "react";

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
  focus:     "#0057b8",
} as const;

const S = {
  sr: {
    position: "absolute" as const,
    width: 1, height: 1,
    padding: 0, margin: -1,
    overflow: "hidden" as const,
    clip: "rect(0,0,0,0)" as const,
    whiteSpace: "nowrap" as const,
    border: 0,
  },
  focusRing: `
    :focus-visible {
      outline: 3px solid ${C.focus};
      outline-offset: 2px;
      border-radius: 4px;
    }
  `,
};

const API = process.env.NEXT_PUBLIC_API_BASE ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RegistrationState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

interface ContactState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

interface PlatformStats {
  total_vendors: number;
  verified_vendors: number;
  active_tenders: number;
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SkipNav() {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute", top: -40, left: 0,
        padding: "8px 16px", background: C.ink, color: C.white,
        fontSize: 14, fontWeight: 600, zIndex: 9999,
        textDecoration: "none", borderRadius: "0 0 4px 0", transition: "top 0.15s",
      }}
      onFocus={(e) => ((e.currentTarget as HTMLElement).style.top = "0")}
      onBlur={(e)  => ((e.currentTarget as HTMLElement).style.top = "-40px")}
    >
      Skip to main content
    </a>
  );
}

function StatCard({ value, label, loading }: { value: string; label: string; loading?: boolean }) {
  return (
    <div style={{ padding: "0 4px" }}>
      <div
        aria-label={loading ? `${label} — loading` : `${value} ${label}`}
        style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: C.white, fontFamily: "'Playfair Display', serif", lineHeight: 1, minHeight: "1.15em" }}
      >
        {loading ? (
          <span
            aria-hidden="true"
            style={{
              display: "inline-block", width: "80%", height: "0.9em",
              background: "rgba(255,255,255,0.12)", borderRadius: 4,
              animation: "shimmer 1.6s infinite",
              backgroundSize: "200% 100%",
              backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
            }}
          />
        ) : value}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.4 }}>
        {label}
      </div>
    </div>
  );
}

function FeatureCard({ number, title, description, tag }: { number: string; title: string; description: string; tag: string }) {
  return (
    <article style={{ padding: "clamp(20px, 3vw, 32px)", border: `1.5px solid ${C.creamDark}`, borderRadius: 8, background: C.white }}>
      <div aria-hidden="true" style={{ fontSize: 11, fontWeight: 700, color: C.slate, letterSpacing: "0.1em", marginBottom: 16 }}>{number}</div>
      <h3 style={{ fontSize: "clamp(15px, 2vw, 18px)", fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif", marginBottom: 10 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.75, marginBottom: 16 }}>{description}</p>
      <span style={{ fontSize: 10, fontWeight: 600, color: C.inkLight, letterSpacing: "0.07em", background: C.cream, border: `1px solid ${C.creamDark}`, padding: "3px 10px", borderRadius: 3, display: "inline-block" }}>
        {tag}
      </span>
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GovernmentLandingPage() {
  const emailId     = useId();
  const errorId     = useId();
  const statusId    = useId();
  const contactNameId    = useId();
  const contactEmailId   = useId();
  const contactAgencyId  = useId();
  const contactMsgId     = useId();
  const contactErrId     = useId();
  const contactStatusId  = useId();

  const [email,      setEmail]      = useState("");
  const [emailError, setEmailError] = useState("");
  const [reg,        setReg]        = useState<RegistrationState>({ status: "idle", message: "" });
  const emailRef  = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [stats,        setStats]        = useState<PlatformStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/marketplace/stats`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d: PlatformStats | null) => { if (d) setStats(d); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  function fmtNum(n: number): string {
    return n.toLocaleString("en-SG");
  }

  // ── Contact form ───────────────────────────────────────────────────────────
  const [contactName,    setContactName]    = useState("");
  const [contactEmail,   setContactEmail]   = useState("");
  const [contactAgency,  setContactAgency]  = useState("");
  const [contactMsg,     setContactMsg]     = useState("");
  const [contact,        setContact]        = useState<ContactState>({ status: "idle", message: "" });
  const contactStatusRef = useRef<HTMLDivElement>(null);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) {
      setContact({ status: "error", message: "Please fill in all required fields." });
      return;
    }
    setContact({ status: "loading", message: "" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim().toLowerCase(),
          agency: contactAgency.trim(),
          message: contactMsg.trim(),
          source: "government-landing",
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail ?? `Submission failed (${res.status})`);
      }
      setContact({ status: "success", message: "Message sent. We'll reply to your email within one business day." });
      setContactName(""); setContactEmail(""); setContactAgency(""); setContactMsg("");
    } catch (err) {
      setContact({ status: "error", message: err instanceof Error ? err.message : "An unexpected error occurred. Please email us directly at evidence@booppa.io." });
    }
    setTimeout(() => contactStatusRef.current?.focus(), 100);
  }

  // ── Registration form ──────────────────────────────────────────────────────
  function validateEmail(val: string): string {
    if (!val.trim()) return "Email address is required.";
    if (!val.includes("@")) return "Please enter a valid email address.";
    if (!val.toLowerCase().endsWith(".gov.sg")) return "Access is restricted to Singapore government email addresses ending in .gov.sg";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) { setEmailError(error); emailRef.current?.focus(); return; }
    setEmailError("");
    setReg({ status: "loading", message: "" });

    try {
      const res = await fetch("/api/government/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || `Server error (${res.status}). Please try again.`);
      }
      setReg({ status: "success", message: `Verification link sent to ${email}. Please check your inbox.` });
      setEmail("");
    } catch (err) {
      setReg({ status: "error", message: err instanceof Error ? err.message : "An unexpected error occurred. Please try again." });
    }
    setTimeout(() => statusRef.current?.focus(), 100);
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
    if (reg.status === "error") setReg({ status: "idle", message: "" });
  }

  // ── Static content ─────────────────────────────────────────────────────────
  const FEATURES = [
    {
      number: "01", title: "Verify Vendor",
      description: "Confirm any Singapore company's compliance credentials via blockchain. Enter a UEN or verification hash and receive an immutable, time-stamped certificate suitable for AGO procurement dossiers.",
      tag: "Blockchain-anchored · Polygon",
    },
    {
      number: "02", title: "Browse & Filter",
      description: "Search Singapore vendors by industry, verification depth, and procurement readiness. Filter to Booppa-verified vendors only and review risk signals before shortlisting.",
      tag: "ACRA-sourced · Real-time",
    },
    {
      number: "03", title: "Compare & Export",
      description: "Select up to four vendors for side-by-side comparison across six due-diligence dimensions. Export a signed PDF Evaluation Shortlist — ready for your AGO procurement dossier.",
      tag: "AGO-auditable · PDF export",
    },
  ];

  const AGENCIES = [
    "Ministry of Finance", "GovTech", "EDB", "JTC Corporation", "HDB",
    "Ministry of Health", "Land Transport Authority", "CPF Board",
    "IMDA", "NEA", "Ministry of Manpower", "CSA",
  ];

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: `1.5px solid ${C.creamDark}`,
    borderRadius: 6, fontSize: 13, color: C.ink, background: C.white,
    fontFamily: "'IBM Plex Sans', sans-serif",
    boxSizing: "border-box" as const,
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'IBM Plex Sans', system-ui, sans-serif; background: ${C.cream}; color: ${C.ink}; }
        ${S.focusRing}
        .gov-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 6vw, 64px); align-items: center; }
        .gov-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .gov-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 56px); align-items: start; }
        .gov-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(20px, 4vw, 32px); padding: clamp(24px, 4vw, 40px); }
        .gov-agency-list { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .gov-email-row { display: flex; gap: 0; max-width: 460px; }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 900px) {
          .gov-hero-grid { grid-template-columns: 1fr; }
          .gov-feature-grid { grid-template-columns: 1fr; }
          .gov-contact-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .gov-email-row { flex-direction: column; }
          .gov-email-row input { border-radius: 6px !important; border-right: 1.5px solid ${C.creamDark} !important; }
          .gov-email-row button { border-radius: 6px !important; margin-top: 8px; }
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
        @media (forced-colors: active) { .gov-badge, .gov-tag { border: 1px solid ButtonText !important; } }
        @media print { nav, footer, form { display: none !important; } }
      `}</style>

      <SkipNav />

      <header role="banner">
        <nav
          aria-label="Main navigation"
          style={{ padding: "16px clamp(20px, 5vw, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.creamDark}`, background: C.cream, position: "sticky", top: 0, zIndex: 50 }}
        >
          <a href="/" aria-label="Booppa — go to homepage" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div aria-hidden="true" style={{ width: 32, height: 32, background: C.ink, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: C.white, fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>B</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: "'Playfair Display', serif" }}>Booppa</div>
              <div style={{ fontSize: 10, color: C.slate, lineHeight: 1 }}>Government Programme</div>
            </div>
          </a>
          <ul role="list" style={{ display: "flex", gap: "clamp(16px, 3vw, 32px)", alignItems: "center", listStyle: "none" }}>
            {[{ href: "#features", label: "Features" }, { href: "#agencies", label: "Agencies" }, { href: "#contact", label: "Contact" }].map(({ href, label }) => (
              <li key={label}>
                <a href={href} style={{ fontSize: 12, color: C.slate, textDecoration: "none", fontWeight: 500 }}>{label}</a>
              </li>
            ))}
            <li>
              <a href="/buyer/dashboard" style={{ padding: "8px 18px", borderRadius: 5, border: `1.5px solid ${C.ink}`, background: "transparent", color: C.ink, fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
                Access Dashboard
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1} style={{ outline: "none" }}>

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section aria-labelledby="hero-heading" style={{ padding: "clamp(48px, 8vw, 88px) clamp(20px, 5vw, 48px)", maxWidth: 1100, margin: "0 auto" }}>
          <div className="gov-hero-grid">
            <div>
              <div className="gov-badge" role="img" aria-label="Singapore Government Procurement Programme" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.inkLight}40`, borderRadius: 4, padding: "5px 12px", marginBottom: 24 }}>
                <div aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: C.coral, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: C.inkLight, letterSpacing: "0.1em" }}>SINGAPORE GOVERNMENT PROCUREMENT PROGRAMME</span>
              </div>

              <h1 id="hero-heading" style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 700, lineHeight: 1.15, color: C.ink, fontFamily: "'Playfair Display', serif", marginBottom: 20, letterSpacing: "-0.02em" }}>
                Vendor Intelligence<br />
                <span style={{ color: C.inkLight }}>for Singapore&apos;s</span><br />
                Procurement Officers
              </h1>

              <p style={{ fontSize: "clamp(13px, 1.5vw, 15px)", color: C.slate, lineHeight: 1.8, marginBottom: 36, maxWidth: 480 }}>
                Verify vendor credentials, compare procurement readiness, and generate AGO-auditable evaluation records — at no cost to government agencies.
              </p>

              <section aria-labelledby="register-heading">
                <h2 id="register-heading" style={S.sr}>Request access to the Government Procurement Dashboard</h2>

                {reg.status !== "success" ? (
                  <form onSubmit={handleSubmit} noValidate aria-describedby={errorId}>
                    <label htmlFor={emailId} style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.slate, letterSpacing: "0.08em", marginBottom: 6 }}>
                      GOVERNMENT EMAIL ADDRESS
                    </label>
                    <div className="gov-email-row">
                      <input
                        ref={emailRef}
                        id={emailId}
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="your.name@agency.gov.sg"
                        required
                        aria-required="true"
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? errorId : undefined}
                        disabled={reg.status === "loading"}
                        style={{ flex: 1, padding: "13px 16px", border: `1.5px solid ${emailError ? C.coral : C.creamDark}`, borderRight: "none", borderRadius: "6px 0 0 6px", fontSize: 13, color: C.ink, background: reg.status === "loading" ? C.cream : C.white, fontFamily: "'IBM Plex Sans', sans-serif", minWidth: 0 }}
                      />
                      <button
                        type="submit"
                        disabled={reg.status === "loading"}
                        aria-busy={reg.status === "loading"}
                        style={{ padding: "13px clamp(14px, 2vw, 22px)", background: reg.status === "loading" ? C.slate : C.ink, color: C.white, border: "none", borderRadius: "0 6px 6px 0", fontSize: 12, fontWeight: 600, cursor: reg.status === "loading" ? "wait" : "pointer", fontFamily: "'IBM Plex Sans', sans-serif", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.15s" }}
                      >
                        {reg.status === "loading" ? "Sending…" : "Request Access"}
                      </button>
                    </div>

                    {emailError && (
                      <p id={errorId} role="alert" aria-live="assertive" style={{ fontSize: 12, color: C.coral, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <span aria-hidden="true">⚠</span>{emailError}
                      </p>
                    )}
                    {reg.status === "error" && (
                      <p role="alert" aria-live="assertive" style={{ fontSize: 12, color: C.coral, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <span aria-hidden="true">⚠</span>{reg.message}
                      </p>
                    )}
                    <p style={{ fontSize: 10, color: C.slate, marginTop: 8 }}>
                      Access is reserved for Singapore government email addresses. A verification link will be sent immediately.
                    </p>
                  </form>
                ) : (
                  <div ref={statusRef} id={statusId} role="status" aria-live="polite" tabIndex={-1} style={{ padding: "16px 20px", borderRadius: 6, background: "rgba(26,107,69,0.07)", border: `1.5px solid rgba(26,107,69,0.25)`, outline: "none" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.verified }}>✓ {reg.message}</p>
                    <p style={{ fontSize: 11, color: C.slate, marginTop: 6 }}>
                      Can&apos;t find the email? Check your spam folder or{" "}
                      <button type="button" onClick={() => setReg({ status: "idle", message: "" })} style={{ background: "none", border: "none", color: C.inkLight, cursor: "pointer", fontWeight: 600, fontSize: 11, padding: 0, textDecoration: "underline" }}>
                        try again
                      </button>.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Stats panel */}
            <aside aria-label="Platform statistics">
              <div style={{ background: C.ink, borderRadius: 12, overflow: "hidden" }}>
                <div className="gov-stats-grid">
                  <StatCard
                    value={stats ? fmtNum(stats.total_vendors) : "—"}
                    label="Singapore vendors indexed"
                    loading={statsLoading}
                  />
                  <StatCard
                    value={stats ? fmtNum(stats.verified_vendors) : "—"}
                    label="Booppa-verified entities"
                    loading={statsLoading}
                  />
                  <StatCard
                    value={stats ? fmtNum(stats.active_tenders) : "—"}
                    label="GeBIZ tenders tracked live"
                    loading={statsLoading}
                  />
                  <StatCard
                    value="S$0"
                    label="Cost to government agencies"
                    loading={false}
                  />
                </div>
                <div style={{ padding: "clamp(16px, 3vw, 24px) clamp(24px, 4vw, 40px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}>
                    Data sourced from ACRA, GeBIZ, and anchored on the Polygon blockchain. All records are immutable and carry an AGO-admissible audit trail.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────────── */}
        <section id="features" aria-labelledby="features-heading" style={{ background: C.white, padding: "clamp(48px, 7vw, 80px) clamp(20px, 5vw, 48px)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontSize: 10, color: C.slate, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>WHAT PROCUREMENT OFFICERS CAN DO</p>
            <h2 id="features-heading" style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif", marginBottom: 40 }}>
              Three tools. One dashboard. Zero cost.
            </h2>
            <div className="gov-feature-grid" role="list">
              {FEATURES.map((f) => (
                <div key={f.number} role="listitem"><FeatureCard {...f} /></div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Agencies ───────────────────────────────────────────────────────── */}
        <section id="agencies" aria-labelledby="agencies-heading" style={{ padding: "clamp(40px, 6vw, 64px) clamp(20px, 5vw, 48px)", background: C.cream, borderTop: `1px solid ${C.creamDark}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 id="agencies-heading" style={{ fontSize: 10, color: C.slate, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 20, textAlign: "center" }}>
              BUILT FOR PROCUREMENT TEAMS ACROSS
            </h2>
            <ul className="gov-agency-list" role="list" aria-label="Singapore government agencies">
              {AGENCIES.map((a) => (
                <li key={a} style={{ fontSize: 12, color: C.inkLight, fontWeight: 500, padding: "5px 14px", border: `1px solid ${C.mist}`, borderRadius: 20, background: C.white, listStyle: "none" }}>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="cta-heading" style={{ padding: "clamp(40px, 6vw, 64px) clamp(20px, 5vw, 48px)", background: C.ink }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <h2 id="cta-heading" style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: C.white, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>
              Ready to transform your vendor due diligence?
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 28, lineHeight: 1.7 }}>
              Join Singapore government procurement teams already using Booppa to verify vendors faster, compare objectively, and produce AGO-ready evaluation records in minutes.
            </p>
            <a href="#hero-heading" style={{ display: "inline-block", padding: "12px 28px", background: C.white, color: C.ink, borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Request Free Access →
            </a>
          </div>
        </section>

        {/* ── Contact ─────────────────────────────────────────────────────────── */}
        <section id="contact" aria-labelledby="contact-heading" style={{ padding: "clamp(48px, 7vw, 80px) clamp(20px, 5vw, 48px)", background: C.cream, borderTop: `1px solid ${C.creamDark}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="gov-contact-grid">

              {/* Left — contact info */}
              <div>
                <p style={{ fontSize: 10, color: C.slate, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>GET IN TOUCH</p>
                <h2 id="contact-heading" style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>
                  Questions from your agency?
                </h2>
                <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.8, marginBottom: 32, maxWidth: 400 }}>
                  Whether you need a walkthrough, have questions about data sources, or want to onboard your entire procurement team — we&apos;re here to help.
                </p>

                <dl style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <dt style={{ fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 4 }}>EMAIL</dt>
                    <dd>
                      <a
                        href="mailto:evidence@booppa.io"
                        style={{ fontSize: 14, fontWeight: 600, color: C.ink, textDecoration: "none", fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        evidence@booppa.io
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 4 }}>RESPONSE TIME</dt>
                    <dd style={{ fontSize: 13, color: C.inkMid }}>Within one business day</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 4 }}>FOR TECHNICAL ISSUES</dt>
                    <dd style={{ fontSize: 13, color: C.inkMid }}>
                      Please include your .gov.sg email and a brief description of the issue.
                    </dd>
                  </div>
                </dl>

                <div style={{ marginTop: 36, padding: "16px 20px", background: C.white, border: `1.5px solid ${C.creamDark}`, borderRadius: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Need access right away?</p>
                  <p style={{ fontSize: 12, color: C.slate, lineHeight: 1.7 }}>
                    Use the registration form above with your .gov.sg email — access is provisioned automatically within minutes.
                  </p>
                  <a href="#hero-heading" style={{ display: "inline-block", marginTop: 12, fontSize: 12, fontWeight: 600, color: C.inkLight, textDecoration: "none" }}>
                    Go to registration ↑
                  </a>
                </div>
              </div>

              {/* Right — contact form */}
              <div style={{ background: C.white, border: `1.5px solid ${C.creamDark}`, borderRadius: 10, padding: "clamp(24px, 4vw, 36px)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>
                  Send us a message
                </h3>

                {contact.status === "success" ? (
                  <div
                    ref={contactStatusRef}
                    id={contactStatusId}
                    role="status"
                    aria-live="polite"
                    tabIndex={-1}
                    style={{ padding: "20px", borderRadius: 6, background: "rgba(26,107,69,0.07)", border: `1.5px solid rgba(26,107,69,0.25)`, outline: "none", textAlign: "center" }}
                  >
                    <p style={{ fontSize: 28, marginBottom: 10 }}>✓</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.verified }}>Message sent successfully</p>
                    <p style={{ fontSize: 12, color: C.slate, marginTop: 8, lineHeight: 1.65 }}>{contact.message}</p>
                    <button
                      type="button"
                      onClick={() => setContact({ status: "idle", message: "" })}
                      style={{ marginTop: 16, fontSize: 12, color: C.inkLight, background: "none", border: `1px solid ${C.mist}`, padding: "6px 16px", borderRadius: 5, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} noValidate>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <div>
                        <label htmlFor={contactNameId} style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 5 }}>
                          FULL NAME <span aria-hidden="true" style={{ color: C.coral }}>*</span>
                        </label>
                        <input
                          id={contactNameId}
                          type="text"
                          name="name"
                          value={contactName}
                          onChange={(e) => { setContactName(e.target.value); if (contact.status === "error") setContact({ status: "idle", message: "" }); }}
                          placeholder="Chan Wei Lin"
                          required
                          aria-required="true"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label htmlFor={contactEmailId} style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 5 }}>
                          EMAIL ADDRESS <span aria-hidden="true" style={{ color: C.coral }}>*</span>
                        </label>
                        <input
                          id={contactEmailId}
                          type="email"
                          name="email"
                          value={contactEmail}
                          onChange={(e) => { setContactEmail(e.target.value); if (contact.status === "error") setContact({ status: "idle", message: "" }); }}
                          placeholder="name@agency.gov.sg"
                          required
                          aria-required="true"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label htmlFor={contactAgencyId} style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 5 }}>
                        AGENCY / MINISTRY
                      </label>
                      <input
                        id={contactAgencyId}
                        type="text"
                        name="agency"
                        value={contactAgency}
                        onChange={(e) => setContactAgency(e.target.value)}
                        placeholder="e.g. Ministry of Finance"
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label htmlFor={contactMsgId} style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: "0.09em", marginBottom: 5 }}>
                        MESSAGE <span aria-hidden="true" style={{ color: C.coral }}>*</span>
                      </label>
                      <textarea
                        id={contactMsgId}
                        name="message"
                        value={contactMsg}
                        onChange={(e) => { setContactMsg(e.target.value); if (contact.status === "error") setContact({ status: "idle", message: "" }); }}
                        placeholder="How can we help you? Tell us about your agency's procurement needs or any questions about the platform."
                        required
                        aria-required="true"
                        rows={5}
                        style={{ ...inputStyle, resize: "vertical", minHeight: 120, lineHeight: 1.7 }}
                      />
                    </div>

                    {contact.status === "error" && (
                      <div
                        ref={contactStatusRef}
                        id={contactErrId}
                        role="alert"
                        aria-live="assertive"
                        style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(200,75,49,0.06)", border: `1px solid rgba(200,75,49,0.25)`, marginBottom: 14 }}
                      >
                        <p style={{ fontSize: 12, color: C.coral, display: "flex", alignItems: "center", gap: 6 }}>
                          <span aria-hidden="true">⚠</span>{contact.message}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={contact.status === "loading"}
                      aria-busy={contact.status === "loading"}
                      style={{ width: "100%", padding: "12px", background: contact.status === "loading" ? C.slate : C.ink, color: C.white, border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: contact.status === "loading" ? "wait" : "pointer", fontFamily: "'IBM Plex Sans', sans-serif", transition: "background 0.15s" }}
                    >
                      {contact.status === "loading" ? "Sending…" : "Send Message"}
                    </button>

                    <p style={{ fontSize: 10, color: C.slate, marginTop: 10, textAlign: "center" }}>
                      We respond to all enquiries within one business day.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer role="contentinfo" style={{ padding: "clamp(20px, 3vw, 28px) clamp(20px, 5vw, 48px)", borderTop: `1px solid ${C.creamDark}`, background: C.cream }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <p style={{ fontSize: 11, color: C.slate }}>
              © 2026 Booppa Smart Care LLC ·{" "}
              <a href="mailto:evidence@booppa.io" style={{ color: C.slate }}>evidence@booppa.io</a>
            </p>
            <nav aria-label="Footer navigation">
              <ul style={{ display: "flex", gap: 20, listStyle: "none" }}>
                {[{ href: "/privacy", label: "Privacy Policy" }, { href: "/terms", label: "Terms of Use" }, { href: "/security", label: "Security" }].map(({ href, label }) => (
                  <li key={label}><a href={href} style={{ fontSize: 11, color: C.slate, textDecoration: "none" }}>{label}</a></li>
                ))}
              </ul>
            </nav>
            <p style={{ fontSize: 11, color: C.slate }}>Data: ACRA · GeBIZ · Polygon blockchain</p>
          </div>
        </div>
      </footer>
    </>
  );
}
