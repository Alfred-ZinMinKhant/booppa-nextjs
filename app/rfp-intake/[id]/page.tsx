'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  breach_history: 'none' | 'one' | 'multiple' | 'unknown';
  training_frequency: string;
  key_processors: string;
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
  breach_history: 'unknown',
  training_frequency: '',
  key_processors: '',
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
              'iso_status', 'iso_cert_number', 'iso_cert_expiry',
              'data_hosting', 'primary_cloud', 'breach_history',
              'training_frequency', 'key_processors',
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
      } catch {
        setError('Network error — please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, [intakeId, router]);

  const kitLabel = intake?.rfp_product_type === 'rfp_complete' ? 'RFP Complete Kit' : 'RFP Express Kit';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vendor_url.trim()) {
      setError("Please enter your company website — we scan it to verify your compliance claims.");
      return;
    }
    if (!/^https?:\/\//i.test(form.vendor_url.trim())) {
      setError("Website must start with http:// or https://");
      return;
    }
    if (!form.company_name.trim()) {
      setError('Please enter your company name.');
      return;
    }
    if (!form.rfp_description.trim()) {
      setError('Please describe what you are procuring.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { vendor_url, company_name, rfp_description, sector, ...rest } = form;
      const intake_data: Record<string, string> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (typeof v === 'string' && v.trim()) intake_data[k] = v.trim();
      }
      const res = await fetch(`/api/rfp-intake/${intakeId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_url: vendor_url.trim(),
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
      // Hop straight to the polling/result page so the buyer watches the kit
      // arrive instead of getting dumped on a generic "go to dashboard" card.
      // session_id comes from the Stripe checkout that created this intake.
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
                type="url"
                required
                value={form.vendor_url}
                onChange={(e) => setForm({ ...form, vendor_url: e.target.value })}
                placeholder="https://acme.io"
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#0ea5e9]"
              />
              <p className="text-xs text-[#64748b] mt-1">
                We scan your site to verify ISO/SOC&nbsp;mentions, encryption language, hosting region, and DPO contact — so more answers can be labelled <strong>Verified&nbsp;on&nbsp;your&nbsp;website</strong> instead of AI&nbsp;draft.
              </p>
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
              <Row label="UEN">
                <input
                  type="text"
                  value={form.uen}
                  onChange={(e) => setForm({ ...form, uen: e.target.value })}
                  className="form-input"
                />
              </Row>
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
