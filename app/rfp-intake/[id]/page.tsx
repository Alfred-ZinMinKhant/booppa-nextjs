'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { normalizeUrl, validateNormalizedUrl } from '@/lib/url';

interface Intake {
  id: string;
  rfp_product_type: 'rfp_express' | 'rfp_complete' | string;
  bundle_source: string;
  vendor_url: string | null;
  company_name: string | null;
  status: 'pending' | 'submitted' | string;
  session_id: string | null;
  // Pre-purchase /rfp-acceleration form contents, surfaced by the backend
  // so the brief form can seed itself. Empty object when there's nothing
  // cached (one-click /pricing buy, or cache expired).
  prefill?: {
    rfp_description?: string;
    intake_data?: Record<string, string>;
  };
  created_at: string | null;
}

interface IntakeFields {
  // Required: we scrape vendor_url for ISO/SOC/encryption/cloud mentions to
  // verify claims against published evidence. company_name appears on the
  // generated PDF. Both can be pre-filled from PendingRfpIntake / User profile.
  vendor_url: string;
  company_name: string;
  rfp_description: string;
  sector: string;
  uen: string;
  description: string;
  dpo_appointed: 'yes' | 'no' | 'unknown';
  dpo_name: string;
  dpo_email: string;
  iso_status: 'certified' | 'pursuing' | 'none' | 'unknown';
  iso_cert_number: string;
  iso_cert_expiry: string;
  data_hosting: 'sg' | 'apac' | 'global' | 'unknown';
  primary_cloud: string;
  cross_border_mechanism: string;
  breach_history: 'none' | 'one' | 'multiple' | 'unknown';
  training_frequency: string;
  training_newhire_window: string;
  key_processors: string;
  subcontracting: string;
  // Security & compliance detail fields — supplying these prevents the kit's
  // [Verify: …] follow-up loop (each maps 1:1 to a kit placeholder).
  soc2_status: string;
  dpo_pdpc_reg: string;
  bcp_last_tested: string;
  bcp_rto: string;
  bcp_rpo: string;
  access_review_cadence: string;
  mfa_privileged: string;
  patch_sla: string;
  scan_cadence: string;
  encryption_at_rest: string;
  encryption_in_transit: string;
  key_management: string;
  log_retention: string;
  log_monitoring: string;
  incident_notification_window: string;
}

const EMPTY: IntakeFields = {
  vendor_url: '',
  company_name: '',
  rfp_description: '',
  sector: '',
  uen: '',
  description: '',
  dpo_appointed: 'unknown',
  dpo_name: '',
  dpo_email: '',
  iso_status: 'unknown',
  iso_cert_number: '',
  iso_cert_expiry: '',
  data_hosting: 'unknown',
  primary_cloud: '',
  cross_border_mechanism: '',
  breach_history: 'unknown',
  training_frequency: '',
  training_newhire_window: '',
  key_processors: '',
  subcontracting: '',
  soc2_status: '',
  dpo_pdpc_reg: '',
  bcp_last_tested: '',
  bcp_rto: '',
  bcp_rpo: '',
  access_review_cadence: '',
  mfa_privileged: '',
  patch_sla: '',
  scan_cadence: '',
  encryption_at_rest: '',
  encryption_in_transit: '',
  key_management: '',
  log_retention: '',
  log_monitoring: '',
  incident_notification_window: '',
};

export default function RfpIntakePage() {
  const params = useParams();
  const router = useRouter();
  const intakeId = String(params?.id || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intake, setIntake] = useState<Intake | null>(null);
  const [form, setForm] = useState<IntakeFields>(EMPTY);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Tender-doc upload state. Optional shortcut: buyer drops a tender PDF and
  // we extract structured fields to prefill the form. They review + edit.
  const tenderFileRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractFilledFrom, setExtractFilledFrom] = useState<string | null>(null);

  useEffect(() => {
    if (!intakeId) return;
    (async () => {
      try {
        const res = await fetch(`/api/rfp-intake/${intakeId}`, { cache: 'no-store' });
        if (res.status === 401) {
          router.replace(`/login?from=${encodeURIComponent(`/rfp-intake/${intakeId}`)}`);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Unable to load this RFP intake.');
          return;
        }
        setIntake(data);
        // A prior submission was blocked at the placeholder gate — surface the
        // advanced compliance section so the buyer can supply the missing facts.
        if (data.status === 'needs_more_info') {
          setShowAdvanced(true);
        }
        // Seed the form from anything the buyer entered on /rfp-acceleration
        // before checkout. Only known IntakeFields keys are accepted; anything
        // else in intake_data is ignored. Buyer can edit before submitting.
        const pf = data.prefill;
        if (data.status !== 'submitted') {
          const seed: Partial<IntakeFields> = {};
          // Seed website + company from the intake row itself (these come
          // from the PendingRfpIntake or earlier checkout metadata).
          if (typeof data.vendor_url === 'string' && data.vendor_url) {
            seed.vendor_url = data.vendor_url;
          }
          if (typeof data.company_name === 'string' && data.company_name) {
            seed.company_name = data.company_name;
          }
          if (pf?.rfp_description) {
            seed.rfp_description = pf.rfp_description;
          }
          const id = pf?.intake_data;
          if (id && typeof id === 'object') {
            for (const k of Object.keys(EMPTY) as (keyof IntakeFields)[]) {
              const v = (id as Record<string, unknown>)[k];
              if (typeof v === 'string' && v) {
                (seed as Record<string, string>)[k] = v;
              }
            }
            // Open the advanced section if any compliance facts were
            // pre-filled — otherwise they'd be hidden behind the toggle.
            const advancedKeys: (keyof IntakeFields)[] = [
              'uen', 'description', 'dpo_appointed', 'dpo_name', 'dpo_email',
              'dpo_pdpc_reg', 'iso_status', 'iso_cert_number', 'iso_cert_expiry',
              'soc2_status', 'data_hosting', 'primary_cloud', 'cross_border_mechanism',
              'breach_history', 'training_frequency', 'training_newhire_window',
              'key_processors', 'subcontracting', 'bcp_last_tested', 'bcp_rto', 'bcp_rpo',
              'access_review_cadence', 'mfa_privileged', 'patch_sla', 'scan_cadence',
              'encryption_at_rest', 'encryption_in_transit', 'key_management',
              'log_retention', 'log_monitoring', 'incident_notification_window',
            ];
            if (advancedKeys.some(k => seed[k])) setShowAdvanced(true);
          }
          if (Object.keys(seed).length > 0) {
            setForm(f => ({ ...f, ...seed }));
          }
        }
        if (data.status === 'submitted') {
          setDone(true);
        }
        // A prior submission was blocked at the placeholder gate — open the
        // compliance section so the buyer can complete the missing details
        // (the banner above promises this).
        if (data.status === 'needs_more_info') {
          setShowAdvanced(true);
        }
      } catch {
        setError('Network error — please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, [intakeId, router]);

  // Compliance Bundle buyers see "Compliance Bundle" framing — the RFP kit
  // is an internal deliverable; their headline product is the Cover Sheet.
  const isComplianceBundle = intake?.bundle_source === 'compliance_evidence_pack';
  const kitLabel = isComplianceBundle
    ? 'Compliance Bundle'
    : intake?.rfp_product_type === 'rfp_complete'
      ? 'RFP Complete Kit'
      : 'RFP Express Kit';

  async function handleExtractTender() {
    const files = tenderFileRef.current?.files;
    if (!files || files.length === 0) {
      setExtractError('Choose a PDF to extract from.');
      return;
    }
    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setExtractError('Upload a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setExtractError('PDF too large. Maximum 10 MB.');
      return;
    }
    setExtractError(null);
    setExtractFilledFrom(null);
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/rfp-intake/${intakeId}/extract`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setExtractError(data.detail || 'Extraction failed — please type your brief.');
        return;
      }
      if (!data.extracted) {
        setExtractError(data.reason || "Couldn't extract — please type your brief.");
        return;
      }
      // Merge suggested fields into the form. Buyer reviews + edits.
      const sx = data.extracted as Record<string, unknown>;
      const patch: Partial<IntakeFields> = {};
      if (typeof sx.rfp_description === 'string' && sx.rfp_description.trim()) {
        patch.rfp_description = String(sx.rfp_description).trim();
      }
      if (typeof sx.sector === 'string' && sx.sector.trim() && sx.sector !== 'unknown') {
        patch.sector = String(sx.sector).trim();
      }
      const iso = String(sx.iso_status || 'unknown');
      if (['certified', 'pursuing', 'none', 'unknown'].includes(iso) && iso !== 'unknown') {
        patch.iso_status = iso as IntakeFields['iso_status'];
      }
      const hosting = String(sx.data_hosting || 'unknown');
      if (['sg', 'apac', 'global', 'unknown'].includes(hosting) && hosting !== 'unknown') {
        patch.data_hosting = hosting as IntakeFields['data_hosting'];
      }
      setForm(f => ({ ...f, ...patch }));
      if (patch.iso_status || patch.data_hosting) setShowAdvanced(true);
      setExtractFilledFrom(typeof data.source_filename === 'string' ? data.source_filename : file.name);
    } catch {
      setExtractError('Network error — please type your brief.');
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedUrl = normalizeUrl(form.vendor_url);
    if (!normalizedUrl) {
      setError("Please enter your company website — we scan it to verify your compliance claims.");
      return;
    }
    const urlError = validateNormalizedUrl(normalizedUrl);
    if (urlError) {
      setError(urlError);
      return;
    }
    if (!form.company_name.trim()) {
      setError('Please enter your company name.');
      return;
    }
    if (!form.uen.trim()) {
      setError('Your UEN (Business Registration No.) appears on the GeBIZ-ready kit and is required.');
      return;
    }
    if (!form.rfp_description.trim()) {
      setError('Please describe what you are procuring.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { company_name, rfp_description, sector, ...rest } = form;
      // Drop vendor_url from rest — we send the normalized URL below.
      delete (rest as Record<string, unknown>).vendor_url;
      const intake_data: Record<string, string> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (typeof v === 'string' && v.trim()) intake_data[k] = v.trim();
      }
      const res = await fetch(`/api/rfp-intake/${intakeId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_url: normalizedUrl,
          company_name: company_name.trim(),
          rfp_description: rfp_description.trim(),
          sector: sector.trim() || undefined,
          intake_data: Object.keys(intake_data).length ? intake_data : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed. Please try again.');
        return;
      }
      // Compliance Bundle buyers care about the Cover Sheet, not the bare RFP
      // kit — the RFP output is just one input to the cover sheet. Send them
      // to the cover-sheet status page so they watch the headline deliverable.
      // Everyone else (rfp_complete / rfp_express / rfp_accelerator /
      // enterprise_bid_kit) lands on the RFP Accelerator result page.
      if (isComplianceBundle) {
        router.replace('/compliance/cover-sheet');
        return;
      }
      const sessionId = data.session_id || intake?.session_id;
      if (sessionId) {
        router.replace(`/rfp-acceleration/result?session_id=${encodeURIComponent(sessionId)}`);
        return;
      }
      setDone(true);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <p className="text-[#64748b]">Loading your RFP brief…</p>
      </main>
    );
  }

  if (error && !intake) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#0f172a] mb-3">RFP intake unavailable</h1>
          <p className="text-[#64748b] mb-6">{error}</p>
          <a href="/pricing" className="text-[#0ea5e9] font-semibold">← Back to pricing</a>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
        <div className="max-w-lg text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">Your {kitLabel} is on the way</h1>
          <p className="text-[#64748b] mb-8">
            We&apos;ll email the kit to you as soon as it&apos;s ready — usually within a few minutes.
            You can close this page.
          </p>
          <a
            href="/vendor/dashboard"
            className="inline-block bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] py-16 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#0ea5e9] uppercase tracking-wide">
            {intake?.bundle_source.replace(/_/g, ' ')}
          </p>
          <h1 className="text-3xl font-bold text-[#0f172a] mt-1">
            Tell us about your {kitLabel}
          </h1>
          <p className="text-[#64748b] mt-2">
            A few details and we&apos;ll generate your RFP kit. Required field is marked with an asterisk.
          </p>
        </div>

        {intake?.status === 'needs_more_info' && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>A few more verified details needed.</strong> We couldn&apos;t issue your kit because some
            answers still had unverified placeholders. Complete the compliance details below (we&apos;ve opened
            that section) and resubmit — GeBIZ-ready kits can&apos;t contain blanks.
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company_name" className="block text-sm font-semibold text-[#0f172a] mb-1">
                Company name *
              </label>
              <input
                id="company_name"
                type="text"
                required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Acme Pte Ltd"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
            <div>
              <label htmlFor="vendor_url" className="block text-sm font-semibold text-[#0f172a] mb-1">
                Company website *
              </label>
              <input
                id="vendor_url"
                type="text"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                required
                value={form.vendor_url}
                onChange={(e) => setForm({ ...form, vendor_url: e.target.value })}
                placeholder="acme.io"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#0ea5e9]"
              />
              <p className="text-xs text-[#64748b] mt-1">
                We scan your site to verify ISO/SOC&nbsp;mentions, encryption language, hosting region, and DPO contact — so more answers can be labelled <strong>Verified&nbsp;on&nbsp;your&nbsp;website</strong> instead of AI&nbsp;draft.
              </p>
            </div>
            <div>
              <label htmlFor="uen" className="block text-sm font-semibold text-[#0f172a] mb-1">
                UEN (Business Registration No.) *
              </label>
              <input
                id="uen"
                type="text"
                required
                value={form.uen}
                onChange={(e) => setForm({ ...form, uen: e.target.value })}
                placeholder="e.g. 201912345A"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#0ea5e9]"
              />
              <p className="text-xs text-[#64748b] mt-1">
                This is the field GeBIZ procurement officers check first — it must appear on your kit.
              </p>
            </div>
          </div>
          {/* Skip-the-typing affordance: buyer drops the tender PDF and we
              extract the brief + a few compliance fields. They review + edit
              before submitting. Failure path is graceful — they fall back to
              typing the description by hand. */}
          <div className="border border-dashed border-[#cbd5e1] rounded-lg p-4 bg-[#f8fafc]">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#0f172a]">
                  Skip the typing — upload your tender PDF
                </p>
                <p className="text-xs text-[#64748b] mt-1">
                  We&apos;ll extract the brief, sector, and a couple of compliance facts. Review and edit before submitting. (Optional)
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    ref={tenderFileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="text-xs"
                    onChange={() => { setExtractError(null); setExtractFilledFrom(null); }}
                  />
                  <button
                    type="button"
                    onClick={handleExtractTender}
                    disabled={extracting}
                    className="bg-[#0ea5e9] text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#0284c7] disabled:opacity-50"
                  >
                    {extracting ? 'Extracting…' : 'Extract & pre-fill'}
                  </button>
                </div>
                {extractError && (
                  <p className="text-xs text-red-600 mt-2">{extractError}</p>
                )}
                {extractFilledFrom && (
                  <p className="text-xs text-emerald-700 mt-2">
                    ✓ Pre-filled from <strong>{extractFilledFrom}</strong> — review and edit below before submitting.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="rfp_description" className="block text-sm font-semibold text-[#0f172a] mb-1">
              What are you procuring? *
            </label>
            <textarea
              id="rfp_description"
              required
              rows={4}
              value={form.rfp_description}
              onChange={(e) => setForm({ ...form, rfp_description: e.target.value })}
              placeholder="e.g. Cloud-based HR system for a 50-person team, SG residency required, ISO 27001 preferred."
              className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#0ea5e9]"
            />
          </div>

          <div>
            <label htmlFor="sector" className="block text-sm font-semibold text-[#0f172a] mb-1">
              Sector (optional)
            </label>
            <input
              id="sector"
              type="text"
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              placeholder="e.g. fintech, healthcare, logistics"
              className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#0ea5e9]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm text-[#0ea5e9] font-semibold"
          >
            {showAdvanced ? 'Hide' : 'Add'} compliance details (optional)
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-l-2 border-[#e2e8f0] pl-4">
              <Row label="Short company description">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-input"
                />
              </Row>
              <Row label="DPO appointed?">
                <select
                  value={form.dpo_appointed}
                  onChange={(e) => setForm({ ...form, dpo_appointed: e.target.value as IntakeFields['dpo_appointed'] })}
                  className="form-input"
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Row>
              {form.dpo_appointed === 'yes' && (
                <>
                  <Row label="DPO name">
                    <input
                      type="text"
                      value={form.dpo_name}
                      onChange={(e) => setForm({ ...form, dpo_name: e.target.value })}
                      className="form-input"
                    />
                  </Row>
                  <Row label="DPO email">
                    <input
                      type="email"
                      value={form.dpo_email}
                      onChange={(e) => setForm({ ...form, dpo_email: e.target.value })}
                      className="form-input"
                    />
                  </Row>
                </>
              )}
              <Row label="ISO 27001 status">
                <select
                  value={form.iso_status}
                  onChange={(e) => setForm({ ...form, iso_status: e.target.value as IntakeFields['iso_status'] })}
                  className="form-input"
                >
                  <option value="unknown">Unknown</option>
                  <option value="certified">Certified</option>
                  <option value="pursuing">Pursuing</option>
                  <option value="none">None</option>
                </select>
              </Row>
              {form.iso_status === 'certified' && (
                <>
                  <Row label="ISO cert number">
                    <input
                      type="text"
                      value={form.iso_cert_number}
                      onChange={(e) => setForm({ ...form, iso_cert_number: e.target.value })}
                      className="form-input"
                    />
                  </Row>
                  <Row label="ISO cert expiry">
                    <input
                      type="date"
                      value={form.iso_cert_expiry}
                      onChange={(e) => setForm({ ...form, iso_cert_expiry: e.target.value })}
                      className="form-input"
                    />
                  </Row>
                </>
              )}
              <Row label="Data hosting region">
                <select
                  value={form.data_hosting}
                  onChange={(e) => setForm({ ...form, data_hosting: e.target.value as IntakeFields['data_hosting'] })}
                  className="form-input"
                >
                  <option value="unknown">Unknown</option>
                  <option value="sg">Singapore</option>
                  <option value="apac">APAC</option>
                  <option value="global">Global</option>
                </select>
              </Row>
              <Row label="Primary cloud provider">
                <input
                  type="text"
                  value={form.primary_cloud}
                  onChange={(e) => setForm({ ...form, primary_cloud: e.target.value })}
                  placeholder="AWS, Azure, GCP…"
                  className="form-input"
                />
              </Row>
              <Row label="Breach history (last 24 months)">
                <select
                  value={form.breach_history}
                  onChange={(e) => setForm({ ...form, breach_history: e.target.value as IntakeFields['breach_history'] })}
                  className="form-input"
                >
                  <option value="unknown">Unknown</option>
                  <option value="none">None</option>
                  <option value="one">One incident</option>
                  <option value="multiple">Multiple</option>
                </select>
              </Row>
              <Row label="Staff training frequency">
                <input
                  type="text"
                  value={form.training_frequency}
                  onChange={(e) => setForm({ ...form, training_frequency: e.target.value })}
                  placeholder="Annual, quarterly…"
                  className="form-input"
                />
              </Row>
              <Row label="Key data processors">
                <input
                  type="text"
                  value={form.key_processors}
                  onChange={(e) => setForm({ ...form, key_processors: e.target.value })}
                  placeholder="Comma-separated list"
                  className="form-input"
                />
              </Row>
              <Row label="Subcontracting / offshoring">
                <input
                  type="text"
                  value={form.subcontracting}
                  onChange={(e) => setForm({ ...form, subcontracting: e.target.value })}
                  placeholder="None, or list arrangements"
                  className="form-input"
                />
              </Row>
              <Row label="Cross-border transfer mechanism">
                <input
                  type="text"
                  value={form.cross_border_mechanism}
                  onChange={(e) => setForm({ ...form, cross_border_mechanism: e.target.value })}
                  placeholder="e.g. Standard Contractual Clauses, none"
                  className="form-input"
                />
              </Row>

              {/* Security & compliance specifics — each maps to a kit field. Filling
                  these avoids a follow-up "details needed" email. */}
              <p className="text-xs text-[#64748b] mt-4 mb-1 font-semibold uppercase tracking-wide">
                Security &amp; compliance specifics
              </p>
              <p className="text-xs text-[#94a3b8] mb-2">
                Optional, but anything left blank we&apos;ll ask you to confirm before the kit is finalised.
              </p>
              <Row label="SOC 2 status">
                <input type="text" value={form.soc2_status}
                  onChange={(e) => setForm({ ...form, soc2_status: e.target.value })}
                  placeholder="Type II (2026), pursuing, none…" className="form-input" />
              </Row>
              <Row label="DPO PDPC registration">
                <input type="text" value={form.dpo_pdpc_reg}
                  onChange={(e) => setForm({ ...form, dpo_pdpc_reg: e.target.value })}
                  placeholder="Registration reference, if any" className="form-input" />
              </Row>
              <Row label="BCP last tested">
                <input type="text" value={form.bcp_last_tested}
                  onChange={(e) => setForm({ ...form, bcp_last_tested: e.target.value })}
                  placeholder="e.g. Feb 2026" className="form-input" />
              </Row>
              <Row label="BCP recovery targets (RTO / RPO)">
                <div className="flex gap-2">
                  <input type="text" value={form.bcp_rto}
                    onChange={(e) => setForm({ ...form, bcp_rto: e.target.value })}
                    placeholder="RTO e.g. 4 hours" className="form-input" />
                  <input type="text" value={form.bcp_rpo}
                    onChange={(e) => setForm({ ...form, bcp_rpo: e.target.value })}
                    placeholder="RPO e.g. 1 hour" className="form-input" />
                </div>
              </Row>
              <Row label="New-hire training window">
                <input type="text" value={form.training_newhire_window}
                  onChange={(e) => setForm({ ...form, training_newhire_window: e.target.value })}
                  placeholder="e.g. within 30 days" className="form-input" />
              </Row>
              <Row label="Privileged access review cadence">
                <input type="text" value={form.access_review_cadence}
                  onChange={(e) => setForm({ ...form, access_review_cadence: e.target.value })}
                  placeholder="e.g. quarterly" className="form-input" />
              </Row>
              <Row label="MFA on privileged accounts">
                <input type="text" value={form.mfa_privileged}
                  onChange={(e) => setForm({ ...form, mfa_privileged: e.target.value })}
                  placeholder="Yes / No" className="form-input" />
              </Row>
              <Row label="Critical patch SLA">
                <input type="text" value={form.patch_sla}
                  onChange={(e) => setForm({ ...form, patch_sla: e.target.value })}
                  placeholder="e.g. 14 days" className="form-input" />
              </Row>
              <Row label="Vulnerability scan cadence">
                <input type="text" value={form.scan_cadence}
                  onChange={(e) => setForm({ ...form, scan_cadence: e.target.value })}
                  placeholder="e.g. monthly" className="form-input" />
              </Row>
              <Row label="Encryption (at rest / in transit)">
                <div className="flex gap-2">
                  <input type="text" value={form.encryption_at_rest}
                    onChange={(e) => setForm({ ...form, encryption_at_rest: e.target.value })}
                    placeholder="At rest e.g. AES-256" className="form-input" />
                  <input type="text" value={form.encryption_in_transit}
                    onChange={(e) => setForm({ ...form, encryption_in_transit: e.target.value })}
                    placeholder="In transit e.g. TLS 1.3" className="form-input" />
                </div>
              </Row>
              <Row label="Key management">
                <input type="text" value={form.key_management}
                  onChange={(e) => setForm({ ...form, key_management: e.target.value })}
                  placeholder="e.g. AWS KMS, HSM" className="form-input" />
              </Row>
              <Row label="Audit log retention">
                <input type="text" value={form.log_retention}
                  onChange={(e) => setForm({ ...form, log_retention: e.target.value })}
                  placeholder="e.g. 12 months" className="form-input" />
              </Row>
              <Row label="Log monitoring / anomaly detection">
                <input type="text" value={form.log_monitoring}
                  onChange={(e) => setForm({ ...form, log_monitoring: e.target.value })}
                  placeholder="e.g. CloudWatch + alerting" className="form-input" />
              </Row>
              <Row label="Incident internal notification window">
                <input type="text" value={form.incident_notification_window}
                  onChange={(e) => setForm({ ...form, incident_notification_window: e.target.value })}
                  placeholder="e.g. within 1 hour" className="form-input" />
              </Row>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#94a3b8] text-white font-bold py-3 rounded-lg transition"
          >
            {submitting ? 'Generating your kit…' : `Generate ${kitLabel}`}
          </button>
        </form>
      </div>

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          outline: none;
          background: white;
        }
        :global(.form-input:focus) {
          border-color: #0ea5e9;
        }
      `}</style>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="block text-sm font-medium text-[#0f172a] mb-1">{label}</div>
      {children}
    </div>
  );
}
