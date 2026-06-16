'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface EvidencePack {
  id: string;
  pack_id: string;
  status: 'intake_pending' | 'queued' | 'generating' | 'anchoring' | 'building_pdfs' | 'ready' | 'error' | string;
  session_id: string | null;
  prefill?: { org_name?: string; uen?: string; domain?: string };
  download_urls?: Record<string, string>;
}

interface Fields {
  org_name: string;
  uen: string;
  sector: string;
  employee_count: '' | '1-10' | '11-50' | '51-200' | '200+';
  approver_name: string;
  approver_role: string;
  dpo_name: string;
  dpo_email: string;
  cloud_provider: string;
  other_markets: string;
  it_contact: string;
  domain: string;
}

const EMPTY: Fields = {
  org_name: '', uen: '', sector: '', employee_count: '', approver_name: '',
  approver_role: '', dpo_name: '', dpo_email: '', cloud_provider: '',
  other_markets: '', it_contact: '', domain: '',
};

const DATA_TYPE_PRESETS = ['customer data', 'employee data', 'vendor data', 'financial data', 'health data'];
const SYSTEM_PRESETS = ['AWS', 'Azure', 'GCP', 'Google Workspace', 'Microsoft 365', 'Stripe', 'Xero', 'HubSpot', 'Salesforce'];

// Mirrors DOC_META titles in the backend pdf_builder.
const DOC_TITLES: Record<string, string> = {
  dpmp: 'Data Protection Management Programme',
  ropa: 'Record of Processing Activities (ROPA)',
  data_inventory: 'Data Inventory & Retention Schedule',
  vendor_register: 'Third-Party Processor Register & DPA Checklist',
  breach_runbook: 'Data Breach Response Runbook',
  training: 'Staff Training Register & Completion Evidence',
  review_log: 'Periodic Security Review Log',
};

const READY_POLL_MS = 4000;
const MAX_POLLS = 45;

export default function EvidencePackIntakePage() {
  const params = useParams();
  const router = useRouter();
  const packId = String(params?.id || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pack, setPack] = useState<EvidencePack | null>(null);
  const [form, setForm] = useState<Fields>(EMPTY);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [dataTypesOther, setDataTypesOther] = useState('');
  const [systemsOther, setSystemsOther] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // view: 'form' | 'generating' | 'ready'
  const [view, setView] = useState<'form' | 'generating' | 'ready'>('form');
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const pollRef = useRef(0);

  useEffect(() => {
    if (!packId) return;
    (async () => {
      try {
        const res = await fetch(`/api/evidence-pack-intake/${packId}`, { cache: 'no-store' });
        if (res.status === 401) {
          router.replace(`/login?from=${encodeURIComponent(`/evidence-pack-intake/${packId}`)}`);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Unable to load this evidence pack.');
          return;
        }
        setPack(data);
        const pf = data.prefill || {};
        setForm(f => ({
          ...f,
          org_name: pf.org_name || '',
          uen: pf.uen || '',
          domain: pf.domain || '',
        }));
        if (data.status === 'ready' && data.download_urls) {
          setDownloadUrls(data.download_urls);
          setView('ready');
        } else if (['queued', 'generating', 'anchoring', 'building_pdfs'].includes(data.status)) {
          setView('generating');
        }
      } catch {
        setError('Network error — please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, [packId, router]);

  // Poll for completion once we're in the generating view.
  useEffect(() => {
    if (view !== 'generating') return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/evidence-pack-intake/${packId}`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled && res.ok) {
          if (data.status === 'ready' && data.download_urls) {
            setDownloadUrls(data.download_urls);
            setView('ready');
            return;
          }
          if (data.status === 'error') {
            setError('Generation failed — our team has been alerted. Please contact support.');
            setView('form');
            return;
          }
        }
      } catch { /* keep polling */ }
      pollRef.current += 1;
      if (pollRef.current >= MAX_POLLS) {
        // Don't error out — generation can outlast the page; the buyer is emailed.
        return;
      }
      if (!cancelled) setTimeout(tick, READY_POLL_MS);
    };
    const t = setTimeout(tick, READY_POLL_MS);
    return () => { cancelled = true; clearTimeout(t); };
  }, [view, packId]);

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  }

  function mergeOther(base: string[], other: string): string[] {
    const extra = other.split(',').map(s => s.trim()).filter(Boolean);
    return Array.from(new Set([...base, ...extra]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalDataTypes = mergeOther(dataTypes, dataTypesOther);
    const finalSystems = mergeOther(systems, systemsOther);

    const required: [string, string][] = [
      ['organisation name', form.org_name],
      ['UEN', form.uen],
      ['sector', form.sector],
      ['employee count', form.employee_count],
      ['authorised representative name', form.approver_name],
      ['authorised representative role', form.approver_role],
    ];
    const missing = required.filter(([, v]) => !v.trim()).map(([label]) => label);
    if (finalDataTypes.length === 0) missing.push('at least one data type');
    if (finalSystems.length === 0) missing.push('at least one system');
    if (missing.length) {
      setError(`Please complete: ${missing.join(', ')}.`);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const intake: Record<string, unknown> = {
        org_name: form.org_name.trim(),
        uen: form.uen.trim(),
        sector: form.sector.trim(),
        employee_count: form.employee_count,
        approver_name: form.approver_name.trim(),
        approver_role: form.approver_role.trim(),
        data_types: finalDataTypes,
        systems: finalSystems,
        customer_types: ['B2B clients'],
      };
      // Optional fields — only send when filled.
      for (const k of ['dpo_name', 'dpo_email', 'cloud_provider', 'other_markets', 'it_contact', 'domain'] as const) {
        if (form[k].trim()) intake[k] = form[k].trim();
      }

      const res = await fetch(`/api/evidence-pack-intake/${packId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed. Please try again.');
        return;
      }
      pollRef.current = 0;
      setView('generating');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <p className="text-[#64748b]">Loading your evidence pack…</p>
      </main>
    );
  }

  if (error && !pack) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#0f172a] mb-3">Evidence pack unavailable</h1>
          <p className="text-[#64748b] mb-6">{error}</p>
          <a href="/pricing" className="text-[#0ea5e9] font-semibold">← Back to pricing</a>
        </div>
      </main>
    );
  }

  if (view === 'generating') {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6 py-16">
        <div className="max-w-lg text-center">
          <div className="text-5xl mb-4 animate-pulse">📑</div>
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">Generating your Evidence Pack</h1>
          <p className="text-[#64748b] mb-2">
            We&apos;re drafting and anchoring your seven PDPA governance documents. This usually takes a minute or two.
          </p>
          <p className="text-[#94a3b8] text-sm">
            You can close this page — we&apos;ll email you the pack as soon as it&apos;s ready.
          </p>
        </div>
      </main>
    );
  }

  if (view === 'ready') {
    const entries = Object.entries(downloadUrls);
    return (
      <main className="min-h-screen bg-[#f8fafc] py-16 px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✓</div>
            <h1 className="text-3xl font-bold text-[#0f172a]">Your Evidence Pack is ready</h1>
            <p className="text-[#64748b] mt-2">Seven PDPA governance documents, ready to download.</p>
          </div>
          <div className="mb-5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Each document is an AI-generated DRAFT.</strong> It has no evidentiary value until your
            authorised representative reviews, corrects, and signs it. Hashes are anchored on the Polygon
            Amoy testnet for tamper-checking — a testnet timestamp evidences existence, it is not a mainnet
            or RFC&nbsp;3161 timestamp.
          </div>
          <ul className="space-y-2">
            {entries.map(([docType, url]) => (
              <li key={docType}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#e2e8f0] hover:border-[#10b981] hover:bg-[#f0fdf4] transition"
                >
                  <span className="text-[#0f172a] text-sm font-medium">{DOC_TITLES[docType] || docType}</span>
                  <span className="text-[#10b981] text-sm font-semibold">Download PDF →</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="text-center mt-8">
            <a href="/vendor/dashboard" className="inline-block bg-[#0f172a] hover:bg-[#1e293b] text-white px-6 py-3 rounded-lg font-semibold">
              Go to dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#f8fafc] py-16 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#10b981] uppercase tracking-wide">PDPA Compliance Evidence Pack</p>
          <h1 className="text-3xl font-bold text-[#0f172a] mt-1">Tell us about your organisation</h1>
          <p className="text-[#64748b] mt-2">
            We generate seven PDPA governance documents tailored to your actual operations. Required fields are marked with an asterisk.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Row label="Organisation name *">
              <input type="text" required value={form.org_name}
                onChange={(e) => setForm({ ...form, org_name: e.target.value })}
                placeholder="e.g. Acme Pte Ltd" className="form-input" />
            </Row>
            <Row label="UEN *">
              <input type="text" required value={form.uen}
                onChange={(e) => setForm({ ...form, uen: e.target.value })}
                placeholder="e.g. 201912345A" className="form-input" />
            </Row>
            <Row label="Sector *">
              <input type="text" required value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                placeholder="e.g. fintech, healthcare, logistics" className="form-input" />
            </Row>
            <Row label="Employee count *">
              <select required value={form.employee_count}
                onChange={(e) => setForm({ ...form, employee_count: e.target.value as Fields['employee_count'] })}
                className="form-input">
                <option value="">Select…</option>
                <option value="1-10">1–10</option>
                <option value="11-50">11–50</option>
                <option value="51-200">51–200</option>
                <option value="200+">200+</option>
              </select>
            </Row>
            <Row label="Authorised representative *">
              <input type="text" required value={form.approver_name}
                onChange={(e) => setForm({ ...form, approver_name: e.target.value })}
                placeholder="Full name" className="form-input" />
            </Row>
            <Row label="Representative role *">
              <input type="text" required value={form.approver_role}
                onChange={(e) => setForm({ ...form, approver_role: e.target.value })}
                placeholder="e.g. Managing Director" className="form-input" />
            </Row>
          </div>

          <Row label="Personal data types processed *">
            <CheckboxGroup options={DATA_TYPE_PRESETS} selected={dataTypes}
              onToggle={(v) => toggle(dataTypes, setDataTypes, v)} />
            <input type="text" value={dataTypesOther}
              onChange={(e) => setDataTypesOther(e.target.value)}
              placeholder="Other (comma-separated)" className="form-input mt-2" />
          </Row>

          <Row label="Systems & vendors in use *">
            <CheckboxGroup options={SYSTEM_PRESETS} selected={systems}
              onToggle={(v) => toggle(systems, setSystems, v)} />
            <input type="text" value={systemsOther}
              onChange={(e) => setSystemsOther(e.target.value)}
              placeholder="Other (comma-separated)" className="form-input mt-2" />
          </Row>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Row label="DPO name (optional)">
              <input type="text" value={form.dpo_name}
                onChange={(e) => setForm({ ...form, dpo_name: e.target.value })} className="form-input" />
            </Row>
            <Row label="DPO email (optional)">
              <input type="email" value={form.dpo_email}
                onChange={(e) => setForm({ ...form, dpo_email: e.target.value })} className="form-input" />
            </Row>
            <Row label="Primary cloud provider (optional)">
              <input type="text" value={form.cloud_provider}
                onChange={(e) => setForm({ ...form, cloud_provider: e.target.value })}
                placeholder="AWS, Azure, GCP…" className="form-input" />
            </Row>
            <Row label="Other markets served (optional)">
              <input type="text" value={form.other_markets}
                onChange={(e) => setForm({ ...form, other_markets: e.target.value })}
                placeholder="e.g. Malaysia, EU" className="form-input" />
            </Row>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-[#94a3b8] text-white font-bold py-3 rounded-lg transition">
            {submitting ? 'Submitting…' : 'Generate my Evidence Pack'}
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
        :global(.form-input:focus) { border-color: #10b981; }
      `}</style>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="block text-sm font-semibold text-[#0f172a] mb-1">{label}</div>
      {children}
    </div>
  );
}

function CheckboxGroup({ options, selected, onToggle }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-full border text-sm transition ${
              on
                ? 'bg-[#10b981] border-[#10b981] text-white'
                : 'bg-white border-[#cbd5e1] text-[#334155] hover:border-[#10b981]'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
