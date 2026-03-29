'use client';

import { useState } from 'react';
import { config } from '@/lib/config';

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

interface VendorForm {
  company_name: string;
  vendor_url: string;
  rfp_description: string;
  uen: string;
  description: string;
  dpo_appointed: string;
  dpo_name: string;
  dpo_email: string;
  iso_status: string;
  iso_cert_number: string;
  iso_cert_expiry: string;
  data_hosting: string;
  primary_cloud: string;
  breach_history: string;
  bcp_last_tested: string;
  training_frequency: string;
  key_processors: string;
}

const EMPTY_FORM: VendorForm = {
  company_name: '',
  vendor_url: '',
  rfp_description: '',
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
  bcp_last_tested: '',
  training_frequency: '',
  key_processors: '',
};

export default function RFPAccelerationPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<string | null>(null);
  const [form, setForm] = useState<VendorForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  function openModal(productType: string) {
    setModalProduct(productType);
    setFormError('');
  }

  function closeModal() {
    setModalProduct(null);
    setFormError('');
    setForm(EMPTY_FORM);
    setShowAdvanced(false);
  }

  async function handleCheckout(productType: string, vendorForm: VendorForm) {
    if (!vendorForm.company_name.trim()) {
      setFormError('Company name is required.');
      return;
    }
    if (!vendorForm.vendor_url.trim()) {
      setFormError('Company website is required.');
      return;
    }
    setLoading(productType);
    setFormError('');
    try {
      const intake: Record<string, string> = {};
      if (vendorForm.uen.trim()) intake.uen = vendorForm.uen.trim();
      if (vendorForm.description.trim()) intake.description = vendorForm.description.trim();
      if (vendorForm.dpo_appointed !== 'unknown') intake.dpo_appointed = vendorForm.dpo_appointed;
      if (vendorForm.dpo_name.trim()) intake.dpo_name = vendorForm.dpo_name.trim();
      if (vendorForm.dpo_email.trim()) intake.dpo_email = vendorForm.dpo_email.trim();
      if (vendorForm.iso_status !== 'unknown') intake.iso_status = vendorForm.iso_status;
      if (vendorForm.iso_cert_number.trim()) intake.iso_cert_number = vendorForm.iso_cert_number.trim();
      if (vendorForm.iso_cert_expiry.trim()) intake.iso_cert_expiry = vendorForm.iso_cert_expiry.trim();
      if (vendorForm.data_hosting !== 'unknown') intake.data_hosting = vendorForm.data_hosting;
      if (vendorForm.primary_cloud.trim()) intake.primary_cloud = vendorForm.primary_cloud.trim();
      if (vendorForm.breach_history !== 'unknown') intake.breach_history = vendorForm.breach_history;
      if (vendorForm.bcp_last_tested.trim()) intake.bcp_last_tested = vendorForm.bcp_last_tested.trim();
      if (vendorForm.training_frequency.trim()) intake.training_frequency = vendorForm.training_frequency.trim();
      if (vendorForm.key_processors.trim()) intake.key_processors = vendorForm.key_processors.trim();

      const res = await fetch(`${config.apiUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType,
          company_name: vendorForm.company_name.trim(),
          vendor_url: normalizeUrl(vendorForm.vendor_url),
          rfp_description: vendorForm.rfp_description.trim(),
          intake_data: Object.keys(intake).length > 0 ? intake : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setFormError(data.detail || 'Checkout failed. Please try again.');
        setLoading(null);
      }
    } catch {
      setFormError('Network error. Please try again.');
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Vendor info modal */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-[#0f172a] mb-1">Your Company Details</h2>
            <p className="text-sm text-[#64748b] mb-6">
              We need these to generate your blockchain-verified RFP evidence package.
            </p>

            {formError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{formError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-1">Company Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                  placeholder="Acme Pte Ltd"
                  value={form.company_name}
                  onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-1">Company Website <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                  placeholder="https://acme.com"
                  value={form.vendor_url}
                  onChange={e => setForm(f => ({ ...f, vendor_url: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-1">RFP Context <span className="text-[#94a3b8] font-normal">(optional)</span></label>
                <textarea
                  className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] resize-none"
                  rows={2}
                  placeholder="Brief description of the RFP you're responding to…"
                  value={form.rfp_description}
                  onChange={e => setForm(f => ({ ...f, rfp_description: e.target.value }))}
                />
              </div>

              <div className="pt-3 border-t border-[#f1f5f9]">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-3">
                  Company Facts <span className="font-normal normal-case">(makes answers more accurate)</span>
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#0f172a] mb-1">UEN (Singapore Reg. No.) <span className="text-[#94a3b8] font-normal">(optional)</span></label>
                    <input
                      type="text"
                      className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      placeholder="e.g. 202012345K"
                      value={form.uen}
                      onChange={e => setForm(f => ({ ...f, uen: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0f172a] mb-1">What does your company do?</label>
                    <input
                      type="text"
                      className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      placeholder="e.g. B2B SaaS for HR management"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#0f172a] mb-1">DPO Appointed?</label>
                      <select
                        className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                        value={form.dpo_appointed}
                        onChange={e => setForm(f => ({ ...f, dpo_appointed: e.target.value }))}
                      >
                        <option value="unknown">Not sure</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="in-progress">In progress</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0f172a] mb-1">ISO 27001 / SOC 2?</label>
                      <select
                        className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                        value={form.iso_status}
                        onChange={e => setForm(f => ({ ...f, iso_status: e.target.value }))}
                      >
                        <option value="unknown">Not sure</option>
                        <option value="none">None</option>
                        <option value="pursuing">Pursuing</option>
                        <option value="certified">Certified</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0f172a] mb-1">Data hosted in SG?</label>
                      <select
                        className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                        value={form.data_hosting}
                        onChange={e => setForm(f => ({ ...f, data_hosting: e.target.value }))}
                      >
                        <option value="unknown">Not sure</option>
                        <option value="singapore">Yes, Singapore</option>
                        <option value="partial">Partial</option>
                        <option value="overseas">Overseas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0f172a] mb-1">Breaches (24 months)?</label>
                      <select
                        className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                        value={form.breach_history}
                        onChange={e => setForm(f => ({ ...f, breach_history: e.target.value }))}
                      >
                        <option value="unknown">Not sure</option>
                        <option value="no">None</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional: DPO contact details */}
                  {form.dpo_appointed === 'yes' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-medium text-[#0f172a] mb-1">DPO Full Name <span className="text-[#94a3b8] font-normal">(recommended)</span></label>
                        <input
                          type="text"
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                          placeholder="Jane Tan"
                          value={form.dpo_name}
                          onChange={e => setForm(f => ({ ...f, dpo_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#0f172a] mb-1">DPO Email <span className="text-[#94a3b8] font-normal">(recommended)</span></label>
                        <input
                          type="email"
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                          placeholder="dpo@company.com"
                          value={form.dpo_email}
                          onChange={e => setForm(f => ({ ...f, dpo_email: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Conditional: ISO cert number */}
                  {form.iso_status === 'certified' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-medium text-[#0f172a] mb-1">ISO Cert Number <span className="text-[#94a3b8] font-normal">(recommended)</span></label>
                        <input
                          type="text"
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                          placeholder="IS 12345"
                          value={form.iso_cert_number}
                          onChange={e => setForm(f => ({ ...f, iso_cert_number: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#0f172a] mb-1">Cert Expiry Date</label>
                        <input
                          type="text"
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                          placeholder="Dec 2026"
                          value={form.iso_cert_expiry}
                          onChange={e => setForm(f => ({ ...f, iso_cert_expiry: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Advanced details — toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(v => !v)}
                    className="text-xs text-[#64748b] hover:text-[#10b981] transition-colors mt-1 text-left"
                  >
                    {showAdvanced ? '▲ Hide advanced details' : '▼ Add more details (BCP, training, cloud provider)'}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#0f172a] mb-1">Cloud Provider</label>
                          <input
                            type="text"
                            className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                            placeholder="AWS ap-southeast-1"
                            value={form.primary_cloud}
                            onChange={e => setForm(f => ({ ...f, primary_cloud: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#0f172a] mb-1">BCP Last Tested</label>
                          <input
                            type="text"
                            className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                            placeholder="Jan 2025"
                            value={form.bcp_last_tested}
                            onChange={e => setForm(f => ({ ...f, bcp_last_tested: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#0f172a] mb-1">Security Training Frequency</label>
                        <input
                          type="text"
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                          placeholder="e.g. Quarterly, Annual"
                          value={form.training_frequency}
                          onChange={e => setForm(f => ({ ...f, training_frequency: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#0f172a] mb-1">Key Third-Party Data Processors</label>
                        <input
                          type="text"
                          className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                          placeholder="e.g. AWS, Stripe, Sendgrid"
                          value={form.key_processors}
                          onChange={e => setForm(f => ({ ...f, key_processors: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#64748b] hover:border-[#94a3b8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckout(modalProduct, form)}
                disabled={loading === modalProduct}
                className="flex-1 px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors disabled:opacity-60"
              >
                {loading === modalProduct ? 'Redirecting…' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#f8fafc] to-white -z-10" />
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#059669] mb-8 bg-[#f0fdf4]">
            <span className="w-2 h-2 bg-[#10b981] rounded-full" />
            New: RFP Acceleration Suite
          </div>
          <h1 className="text-4xl lg:text-7xl font-black text-[#0f172a] mb-6 tracking-tight">
            Win RFPs Faster.<br />
            <span className="text-[#10b981]">Evidence-First.</span>
          </h1>
          <p className="text-xl text-[#64748b] mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop manually answering the same security and compliance questions.
            BOOPPA generates blockchain-verified evidence that procurement teams trust.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => openModal('rfp_express')}
              disabled={loading === 'rfp_express'}
              className="btn btn-primary px-10 py-4 text-lg disabled:opacity-60"
            >
              {loading === 'rfp_express' ? 'Redirecting…' : 'RFP Kit Express — SGD 249'}
            </button>
            <button
              onClick={() => openModal('rfp_complete')}
              disabled={loading === 'rfp_complete'}
              className="btn btn-secondary px-10 py-4 text-lg disabled:opacity-60"
            >
              {loading === 'rfp_complete' ? 'Redirecting…' : 'RFP Kit Complete — SGD 599'}
            </button>
          </div>
        </div>
      </section>

      {/* Product Comparison */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Express Tier */}
            <div id="express" className="bg-white p-12 rounded-[2.5rem] border-2 border-[#e2e8f0] relative overflow-hidden transition-all hover:border-[#10b981]">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-[#0f172a] mb-2">RFP KIT EXPRESS</h3>
                <div className="text-4xl font-black text-[#10b981] mb-6">SGD 249</div>
                <p className="text-[#64748b]">Perfect for simple RFPs and basic vendor verification.</p>
              </div>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 text-[#0f172a]"><span className="text-[#10b981]">✓</span> 5 Copy-Ready RFP Answers</li>
                <li className="flex items-center gap-3 text-[#0f172a]"><span className="text-[#10b981]">✓</span> RFP Kit Evidence Certificate</li>
                <li className="flex items-center gap-3 text-[#0f172a]"><span className="text-[#10b981]">✓</span> Blockchain Verification</li>
                <li className="flex items-center gap-3 text-[#0f172a]"><span className="text-[#10b981]">✓</span> QR Validation</li>
                <li className="flex items-center gap-3 text-[#64748b] opacity-50"><span className="text-[#cbd5e1]">✕</span> No Editable DOCX</li>
                <li className="flex items-center gap-3 text-[#64748b] opacity-50"><span className="text-[#cbd5e1]">✕</span> No AI Narrative</li>
              </ul>
              <button
                onClick={() => openModal('rfp_express')}
                disabled={loading === 'rfp_express'}
                className="btn btn-primary w-full text-center py-4 block disabled:opacity-60"
              >
                {loading === 'rfp_express' ? 'Redirecting…' : 'Generate Express Evidence'}
              </button>
            </div>

            {/* Complete Tier */}
            <div id="complete" className="bg-[#0f172a] p-12 rounded-[2.5rem] border-2 border-[#10b981] relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Enterprise Ready</div>
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white mb-2">RFP KIT COMPLETE</h3>
                <div className="text-4xl font-black text-[#10b981] mb-6">SGD 599</div>
                <p className="text-white/70">Full vendor procurement pack for high-value tenders.</p>
              </div>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> 15 Advanced RFP Answers</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> Editable DOCX Template</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> AI Compliance Narrative</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> Comprehensive Control Mapping</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> Attestation Letter</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> Priority 12h Delivery</li>
              </ul>
              <button
                onClick={() => openModal('rfp_complete')}
                disabled={loading === 'rfp_complete'}
                className="btn btn-primary w-full text-center py-4 block disabled:opacity-60"
              >
                {loading === 'rfp_complete' ? 'Redirecting…' : 'Get Full RFP Kit'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Advantage */}
      <section className="py-24 bg-[#f8fafc] px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-black text-[#0f172a] mb-8">Reduce Submission Friction</h2>
          <p className="text-lg text-[#64748b] mb-12">
            Procurement teams are tired of vague answers. By providing
            <span className="font-bold text-[#0f172a]"> verifiable evidence</span> up front,
            you move to the top of the pile and close deals faster.
          </p>
        </div>
      </section>
    </main>
  );
}
