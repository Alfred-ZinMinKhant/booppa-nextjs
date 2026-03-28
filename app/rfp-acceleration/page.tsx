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
}

export default function RFPAccelerationPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<string | null>(null);
  const [form, setForm] = useState<VendorForm>({ company_name: '', vendor_url: '', rfp_description: '' });
  const [formError, setFormError] = useState('');

  function openModal(productType: string) {
    setModalProduct(productType);
    setFormError('');
  }

  function closeModal() {
    setModalProduct(null);
    setFormError('');
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
      const res = await fetch(`${config.apiUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType,
          company_name: vendorForm.company_name.trim(),
          vendor_url: normalizeUrl(vendorForm.vendor_url),
          rfp_description: vendorForm.rfp_description.trim(),
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
                  rows={3}
                  placeholder="Brief description of the RFP you're responding to…"
                  value={form.rfp_description}
                  onChange={e => setForm(f => ({ ...f, rfp_description: e.target.value }))}
                />
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
