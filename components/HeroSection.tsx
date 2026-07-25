"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Hero — "Instrument of Record".
 * Booppa's product is a notarized, blockchain-anchored compliance certificate,
 * so the hero is treated as an official security document being issued and
 * sealed, not a generic SaaS dashboard. Design language: intaglio / guilloché
 * security printing (ink ground, certificate stock, gold notary foil).
 * Fonts (IBM Plex Sans / Mono) are already loaded in app/layout.tsx.
 */

// Guilloché rosette — the anti-counterfeit engraving used on banknotes and
// certificates. Purely decorative texture; hidden from assistive tech.
function Rosette({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="-200 -200 400 400"
			aria-hidden="true"
			focusable="false"
		>
			<g fill="none" stroke="currentColor" strokeWidth="0.6">
				{Array.from({ length: 60 }).map((_, i) => (
					<ellipse
						key={i}
						cx="0"
						cy="0"
						rx="180"
						ry="66"
						transform={`rotate(${i * 3})`}
					/>
				))}
			</g>
		</svg>
	);
}

const COPY = {
	vendor: {
		tag: "For vendors · PDPA / MAS",
		lead: "Win the tender.",
		headline: "Proof of compliance,",
		emphasis: "anchored to the public record.",
		sub: "Stop losing RFPs to missing paperwork. Get an audit-ready compliance report — scored, risk-flagged, and notarised on-chain — issued in hours, not weeks.",
		cta: "Get your report",
		href: "/pdpa",
		registrant: "Vendor Pte. Ltd.",
	},
	procurement: {
		tag: "For buyer teams · Procurement",
		lead: "Clear the shortlist.",
		headline: "Verify any vendor",
		emphasis: "against tamper-proof evidence.",
		sub: "Eliminate evaluation risk. Access continuously updated compliance status and blockchain-anchored proof for every vendor you assess — no chasing, no doubt.",
		cta: "Evaluate vendors",
		href: "/solutions/procurement",
		registrant: "Registered Supplier",
	},
} as const;

export default function HeroSection() {
	const [segment, setSegment] = useState<"vendor" | "procurement">("vendor");
	const c = COPY[segment];

	return (
		<section className="bph-hero" aria-labelledby="bph-headline">
			<style dangerouslySetInnerHTML={{ __html: css }} />

			{/* Security-print background: ink ground + faint guilloché rosettes */}
			<div className="bph-bg" aria-hidden="true">
				<Rosette className="bph-rosette bph-rosette--a" />
				<Rosette className="bph-rosette bph-rosette--b" />
			</div>

			<div className="bph-grid">
				{/* ---------- Left: the claim ---------- */}
				<div className="bph-copy">
					<div className="bph-toggle" role="tablist" aria-label="Choose your role">
						<button
							role="tab"
							aria-selected={segment === "vendor"}
							className={segment === "vendor" ? "is-active" : ""}
							onClick={() => setSegment("vendor")}
						>
							Vendors
						</button>
						<button
							role="tab"
							aria-selected={segment === "procurement"}
							className={segment === "procurement" ? "is-active" : ""}
							onClick={() => setSegment("procurement")}
						>
							Buyer teams
						</button>
					</div>

					<p className="bph-eyebrow">
						<span className="bph-live" />
						{c.tag}
					</p>

					<h1 id="bph-headline" className="bph-headline">
						<span className="bph-lead">{c.lead}</span>
						{c.headline}{" "}
						<em>{c.emphasis}</em>
					</h1>

					<p className="bph-sub">{c.sub}</p>

					<div className="bph-actions">
						<Link href={c.href} className="bph-btn bph-btn--primary">
							{c.cta}
						</Link>
						<Link href="#sample-report" className="bph-btn bph-btn--ghost">
							See a sample report
						</Link>
					</div>

					{/* Ledger strip — the record's provenance, set in mono */}
					<dl className="bph-ledger">
						<div>
							<dt>Vendors verified</dt>
							<dd>30,000+</dd>
						</div>
						<div>
							<dt>Anchor</dt>
							<dd>Polygon mainnet</dd>
						</div>
						<div>
							<dt>Format</dt>
							<dd>ISO / audit-ready</dd>
						</div>
					</dl>
				</div>

				{/* ---------- Right: the instrument ---------- */}
				<figure className="bph-cert" aria-label="Sample compliance certificate">
					<Rosette className="bph-cert__seal-guilloche" />

					<header className="bph-cert__head">
						<span className="bph-cert__kicker">Instrument of record</span>
						<span className="bph-cert__id">BPP·2026·X92</span>
					</header>

					<div className="bph-cert__row">
						<span className="bph-cert__label">Registrant</span>
						<span className="bph-cert__value">{c.registrant}</span>
					</div>

					<div className="bph-cert__determination">
						<div>
							<span className="bph-cert__label">Determination</span>
							<span className="bph-cert__score">
								87<i>/100</i>
							</span>
						</div>
						<span className="bph-cert__verdict">Low risk</span>
					</div>

					<div className="bph-cert__meter" aria-hidden="true">
						<span style={{ width: "87%" }} />
					</div>

					<div className="bph-cert__fields">
						<div className="bph-cert__field">
							<span className="bph-cert__label">PDPA obligations</span>
							<span className="bph-cert__pass">Pass · 8 / 8</span>
						</div>
						<div className="bph-cert__field">
							<span className="bph-cert__label">Risk flags</span>
							<span className="bph-cert__flag">2 minor</span>
						</div>
					</div>

					<div className="bph-cert__anchor">
						<span className="bph-cert__anchor-title">Blockchain anchor</span>
						<code className="bph-cert__hash">
							0x8f3a2c91c2···91c24e6b
						</code>
						<div className="bph-cert__anchor-meta">
							<span>BLOCK 64 118 902</span>
							<span>2026·04·23 · 04:22 SGT</span>
						</div>
					</div>

					{/* Gold notary seal — the one bold element */}
					<div className="bph-seal" aria-hidden="true">
						<span className="bph-seal__ring" />
						<span className="bph-seal__mark">✓</span>
						<span className="bph-seal__text">Verified · Immutable</span>
					</div>

					{/* Single scan-line pass on issue */}
					<span className="bph-scan" aria-hidden="true" />
				</figure>
			</div>
		</section>
	);
}

const css = `
.bph-hero{
	position:relative; overflow:hidden;
	background:
		radial-gradient(120% 90% at 82% 8%, #172846 0%, rgba(23,40,70,0) 55%),
		linear-gradient(180deg, #0B1524 0%, #0A1220 100%);
	color:#E8EEF6;
	font-family:"IBM Plex Sans", system-ui, sans-serif;
	padding:5.5rem 1.5rem 6rem;
	min-height:calc(100vh - 80px);
	display:flex; align-items:center;
}
.bph-bg{position:absolute; inset:0; pointer-events:none;}
.bph-rosette{position:absolute; color:#C9A24B; opacity:.055;}
.bph-rosette--a{width:640px; height:640px; top:-180px; right:-140px;}
.bph-rosette--b{width:520px; height:520px; bottom:-220px; left:-160px; color:#34B08E; opacity:.045;}

.bph-grid{
	position:relative; z-index:1;
	width:100%; max-width:1240px; margin:0 auto;
	display:grid; grid-template-columns:1.05fr .95fr; gap:4.5rem; align-items:center;
}

/* ---- Left copy ---- */
.bph-copy{max-width:38rem;}
.bph-toggle{
	display:inline-flex; gap:2px; padding:4px; margin-bottom:2rem;
	border:1px solid rgba(157,176,199,.20); border-radius:999px;
	background:rgba(11,21,36,.5);
}
.bph-toggle button{
	appearance:none; border:0; cursor:pointer;
	font:600 .8rem/1 "IBM Plex Sans",sans-serif; letter-spacing:.01em;
	color:#9DB0C7; background:transparent; padding:.6rem 1.25rem; border-radius:999px;
	transition:color .2s ease, background .2s ease;
}
.bph-toggle button.is-active{color:#0B1524; background:#34B08E;}
.bph-toggle button:not(.is-active):hover{color:#E8EEF6;}

.bph-eyebrow{
	display:inline-flex; align-items:center; gap:.6rem;
	font:500 .72rem/1 "IBM Plex Mono",monospace; letter-spacing:.22em; text-transform:uppercase;
	color:#C9A24B; margin:0 0 1.4rem;
}
.bph-live{
	width:7px; height:7px; border-radius:50%; background:#34B08E;
	box-shadow:0 0 0 0 rgba(52,176,142,.6); animation:bph-pulse 2.4s ease-out infinite;
}

.bph-headline{
	font:600 clamp(2.4rem,4.6vw,4rem)/1.04 "IBM Plex Sans",sans-serif;
	letter-spacing:-.02em; color:#F4F7FB; margin:0 0 1.5rem;
}
.bph-lead{display:block; color:#34B08E; font-weight:600;
	font-size:clamp(1rem,1.4vw,1.15rem); letter-spacing:.02em; margin-bottom:.7rem;}
.bph-headline em{font-style:normal; color:#E4C878;
	background:linear-gradient(180deg,#E4C878,#C9A24B); -webkit-background-clip:text;
	background-clip:text; -webkit-text-fill-color:transparent;}

.bph-sub{
	font:400 clamp(1rem,1.25vw,1.15rem)/1.65 "IBM Plex Sans",sans-serif;
	color:#9DB0C7; margin:0 0 2.2rem; max-width:34rem;
}

.bph-actions{display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:2.6rem;}
.bph-btn{
	display:inline-flex; align-items:center; justify-content:center;
	font:600 1rem/1 "IBM Plex Sans",sans-serif; padding:1rem 1.7rem; border-radius:10px;
	text-decoration:none; transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
}
.bph-btn--primary{background:#34B08E; color:#08131F; box-shadow:0 12px 30px -12px rgba(52,176,142,.7);}
.bph-btn--primary:hover{transform:translateY(-2px); box-shadow:0 18px 38px -12px rgba(52,176,142,.8);}
.bph-btn--ghost{color:#E8EEF6; border:1px solid rgba(157,176,199,.28);}
.bph-btn--ghost:hover{border-color:#C9A24B; color:#E4C878;}

.bph-ledger{
	display:grid; grid-template-columns:repeat(3,auto); gap:2.4rem;
	margin:0; padding-top:1.8rem; border-top:1px solid rgba(157,176,199,.14); width:fit-content;
}
.bph-ledger div{display:flex; flex-direction:column; gap:.35rem;}
.bph-ledger dt{font:500 .64rem/1 "IBM Plex Mono",monospace; letter-spacing:.18em;
	text-transform:uppercase; color:#647a97;}
.bph-ledger dd{margin:0; font:600 .95rem/1 "IBM Plex Sans",sans-serif; color:#E8EEF6;}

/* ---- Right: the certificate ---- */
.bph-cert{
	position:relative; margin:0; isolation:isolate; overflow:hidden;
	background:linear-gradient(180deg,#F6F0E2 0%,#EFE6D2 100%);
	color:#1B2E4A; border-radius:16px;
	padding:2rem 2rem 2.4rem;
	border:1px solid #DCCFB0;
	box-shadow:0 40px 80px -30px rgba(0,0,0,.6), inset 0 0 0 1px rgba(201,162,75,.28),
		inset 0 0 0 6px rgba(255,255,255,.35);
	animation:bph-issue .7s cubic-bezier(.2,.7,.2,1) both;
}
.bph-cert__seal-guilloche{position:absolute; width:340px; height:340px; right:-90px; top:-80px;
	color:#C9A24B; opacity:.10; z-index:0;}
.bph-cert > *{position:relative; z-index:1;}

.bph-cert__head{display:flex; justify-content:space-between; align-items:baseline;
	padding-bottom:1rem; margin-bottom:1.1rem; border-bottom:1px solid rgba(201,162,75,.35);}
.bph-cert__kicker{font:500 .66rem/1 "IBM Plex Mono",monospace; letter-spacing:.24em;
	text-transform:uppercase; color:#9A7B2E;}
.bph-cert__id{font:500 .72rem/1 "IBM Plex Mono",monospace; color:#6B788C; letter-spacing:.08em;}

.bph-cert__label{font:500 .62rem/1 "IBM Plex Mono",monospace; letter-spacing:.16em;
	text-transform:uppercase; color:#8A93A3;}
.bph-cert__row{display:flex; flex-direction:column; gap:.4rem; margin-bottom:1.3rem;}
.bph-cert__value{font:600 1.05rem/1 "IBM Plex Sans",sans-serif; color:#14233B;}

.bph-cert__determination{display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:.8rem;}
.bph-cert__determination > div{display:flex; flex-direction:column; gap:.5rem;}
.bph-cert__score{font:600 3.2rem/.9 "IBM Plex Sans",sans-serif; color:#14233B; letter-spacing:-.03em;}
.bph-cert__score i{font-style:normal; font-size:1.1rem; color:#8A93A3;}
.bph-cert__verdict{font:600 .72rem/1 "IBM Plex Mono",monospace; letter-spacing:.14em;
	text-transform:uppercase; color:#1F7A63; padding:.4rem .7rem; border-radius:6px;
	background:rgba(52,176,142,.14); border:1px solid rgba(31,122,99,.3);}

.bph-cert__meter{height:6px; border-radius:99px; background:rgba(27,46,74,.10); overflow:hidden; margin-bottom:1.5rem;}
.bph-cert__meter span{display:block; height:100%; border-radius:99px;
	background:linear-gradient(90deg,#1F7A63,#34B08E); animation:bph-fill 1.1s .35s cubic-bezier(.3,.8,.3,1) both;}

.bph-cert__fields{display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;}
.bph-cert__field{display:flex; flex-direction:column; gap:.45rem; padding:.85rem .9rem;
	background:rgba(255,255,255,.5); border:1px solid #E2D6BC; border-radius:10px;}
.bph-cert__pass{font:600 .82rem/1 "IBM Plex Sans",sans-serif; color:#1F7A63;}
.bph-cert__flag{font:600 .82rem/1 "IBM Plex Sans",sans-serif; color:#B26A16;}

.bph-cert__anchor{padding:1rem 1.1rem; border-radius:10px;
	background:#0B1524; color:#E8EEF6; border:1px solid rgba(201,162,75,.25);}
.bph-cert__anchor-title{display:block; font:500 .6rem/1 "IBM Plex Mono",monospace;
	letter-spacing:.2em; text-transform:uppercase; color:#C9A24B; margin-bottom:.6rem;}
.bph-cert__hash{display:block; font:500 .82rem/1.4 "IBM Plex Mono",monospace;
	color:#9FE7D0; word-break:break-all; margin-bottom:.6rem;}
.bph-cert__anchor-meta{display:flex; justify-content:space-between; gap:1rem;
	font:400 .58rem/1.3 "IBM Plex Mono",monospace; letter-spacing:.08em; color:#6f83a0;}

.bph-seal{position:absolute; z-index:2; right:1.5rem; bottom:1.4rem;
	width:92px; height:92px; display:flex; flex-direction:column; align-items:center; justify-content:center;
	text-align:center; border-radius:50%;
	background:radial-gradient(circle at 38% 32%, #E9CF86 0%, #C9A24B 55%, #A47F30 100%);
	color:#3A2C08; box-shadow:0 8px 20px -6px rgba(120,90,20,.7), inset 0 1px 2px rgba(255,255,255,.5);
	transform:rotate(-9deg); animation:bph-stamp .5s .9s cubic-bezier(.2,1.5,.4,1) both;}
.bph-seal__ring{position:absolute; inset:7px; border-radius:50%; border:1.5px dashed rgba(58,44,8,.5);}
.bph-seal__mark{font-size:1.5rem; font-weight:700; line-height:1;}
.bph-seal__text{font:700 .42rem/1.2 "IBM Plex Mono",monospace; letter-spacing:.12em;
	text-transform:uppercase; margin-top:.2rem; max-width:70px;}

.bph-scan{position:absolute; z-index:3; inset:0; pointer-events:none;
	background:linear-gradient(90deg,transparent, rgba(52,176,142,.35) 50%, transparent);
	mix-blend-mode:screen; transform:translateX(-110%); animation:bph-sweep 1.1s .3s ease-in-out both;}

@keyframes bph-pulse{0%{box-shadow:0 0 0 0 rgba(52,176,142,.55);}
	70%{box-shadow:0 0 0 8px rgba(52,176,142,0);} 100%{box-shadow:0 0 0 0 rgba(52,176,142,0);}}
@keyframes bph-issue{from{opacity:0; transform:translateY(22px) scale(.985);}
	to{opacity:1; transform:none;}}
@keyframes bph-fill{from{width:0;} }
@keyframes bph-stamp{0%{opacity:0; transform:rotate(-9deg) scale(1.9);}
	60%{opacity:1;} 100%{opacity:1; transform:rotate(-9deg) scale(1);}}
@keyframes bph-sweep{to{transform:translateX(110%);}}

@media (max-width:960px){
	.bph-grid{grid-template-columns:1fr; gap:3rem;}
	.bph-cert{max-width:460px;}
}
@media (max-width:520px){
	.bph-hero{padding:3.5rem 1.15rem 4rem;}
	.bph-ledger{grid-template-columns:1fr 1fr; gap:1.4rem 2rem;}
	.bph-cert__score{font-size:2.6rem;}
}

@media (prefers-reduced-motion:reduce){
	.bph-cert,.bph-cert__meter span,.bph-seal{animation:none !important;}
	.bph-scan{display:none;}
	.bph-live{animation:none;}
	.bph-cert__meter span{width:87%;}
	.bph-btn:hover{transform:none;}
}
`;
