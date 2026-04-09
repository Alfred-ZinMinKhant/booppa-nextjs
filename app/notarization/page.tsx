'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { config } from '@/lib/config';
import HardenedClickwrap from '@/components/legal/HardenedClickwrap';

type UploadResult = {
  report_id: string;
  file_hash: string;
  file_name: string;
  file_size: number;
  product_type: string;
};

const PLANS = {
  single:  { label: 'Single Document',  price: 'SGD 69',    perDoc: '', product: 'compliance_notarization_1' },
  batch10: { label: '10 Documents',      price: 'SGD 390',   perDoc: 'SGD 39 each', product: 'compliance_notarization_10' },
  batch50: { label: '50 Documents',      price: 'SGD 1,750', perDoc: 'SGD 35 each', product: 'compliance_notarization_50' },
} as const;

type PlanKey = keyof typeof PLANS;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function NotarizationPage() {
  const apiBase = config.apiUrl;
  const fileRef = useRef<HTMLInputElement>(null);

  // Step state: 'select' → 'upload' → 'checkout'
  const [step, setStep] = useState<'select' | 'upload' | 'checkout'>('select');
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('single');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [consentValid, setConsentValid] = useState(false);

  const handleSelectPlan = (plan: PlanKey) => {
    setSelectedPlan(plan);
    setStep('upload');
    setUploadResult(null);
    setError('');
    // Scroll to upload section
    setTimeout(() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleUpload = async () => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      setError('Please select a file to upload.');
      return;
    }
    const file = files[0];
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum 50 MB.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required so we can deliver your certificate.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('plan', selectedPlan);
      if (email) formData.append('email', email);
      if (companyName) formData.append('company_name', companyName);

      const res = await fetch(`${apiBase}/api/v1/notarize/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(data.detail || 'Upload failed');
      }

      const result: UploadResult = await res.json();
      setUploadResult(result);
      setStep('checkout');
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCheckout = async () => {
    if (!uploadResult) return;
    setCheckingOut(true);
    setError('');

    try {
      const res = await fetch(`${apiBase}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: uploadResult.product_type,
          reportId: uploadResult.report_id,
          customerEmail: email,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.');
      setCheckingOut(false);
    }
  };

  const handleStartOver = () => {
    setStep('select');
    setUploadResult(null);
    setError('');
    setEmail('');
    setCompanyName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <main className="bg-white">
      <section className="py-24 px-6">
        <div className="container max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-black mb-6 text-[#0f172a]">Blockchain Evidence Notarization</h1>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
              Immutable cryptographic timestamps for compliance documents. 
              Court-admissible proof under Singapore Evidence Act.
            </p>
          </div>

          <div className="bg-[#f8fafc] p-10 rounded-3xl border-2 border-[#10b981] mb-12 shadow-sm">
            <h3 className="text-2xl font-bold mb-4 text-[#0f172a]">⛓️ Why Blockchain Notarization?</h3>
            <p className="text-[#64748b]">
              Traditional timestamps can be manipulated. Blockchain provides cryptographic proof 
              that a document existed at a specific date and time — independently verifiable by anyone.
            </p>
          </div>

          {/* Step 1: Select Plan */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4 text-[#0f172a]">
              {step === 'select' ? '① Choose Your Package' : step === 'upload' ? '② Upload Document' : '③ Confirm & Pay'}
            </h2>
            <p className="text-center text-[#64748b] mb-12">
              {step === 'select' && 'Select a notarization package to get started.'}
              {step === 'upload' && `Selected: ${PLANS[selectedPlan].label} — ${PLANS[selectedPlan].price}`}
              {step === 'checkout' && 'Your document has been hashed. Review and proceed to payment.'}
            </p>

            {/* Progress bar */}
            <div className="flex items-center justify-center gap-2 mb-12">
              {['Select Plan', 'Upload', 'Pay'].map((label, i) => {
                const stepIndex = i;
                const currentIndex = step === 'select' ? 0 : step === 'upload' ? 1 : 2;
                const isActive = stepIndex <= currentIndex;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-[#10b981] text-white' : 'bg-[#e2e8f0] text-[#94a3b8]'}`}>
                      {stepIndex < currentIndex ? '✓' : stepIndex + 1}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>{label}</span>
                    {i < 2 && <div className={`w-12 h-0.5 ${isActive && stepIndex < currentIndex ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'}`} />}
                  </div>
                );
              })}
            </div>
            
            {step === 'select' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-3xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Single Document</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 69</div>
                <p className="text-sm text-[#64748b] mb-8">One-time notarization</p>
                <ul className="space-y-4 mb-8">
                  {['SHA-256 hash generation', 'Polygon Amoy testnet timestamp', 'QR verification link', 'Polygonscan proof URL', 'Certificate of notarization (PDF)', '12-month evidence retention'].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleSelectPlan('single')} className="btn btn-primary w-full shadow-lg">
                  Select — SGD 69
                </button>
              </div>

              <div className="bg-white p-10 rounded-3xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Small Batch</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 390</div>
                <p className="text-sm text-[#64748b] mb-8">10 documents (SGD 39 each)</p>
                <ul className="space-y-4 mb-8">
                  <li className="font-bold text-[#0f172a] text-sm">Everything in Single, plus:</li>
                  {['Batch processing (upload 10 files)', 'Consolidated certificate', 'API access for automation', '3-month retention'].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-bold text-[#10b981] mb-8">Save 43% vs single notarization</p>
                <button onClick={() => handleSelectPlan('batch10')} className="btn btn-primary w-full shadow-lg">
                  Select — SGD 390
                </button>
              </div>

              <div className="bg-white p-10 rounded-3xl border-2 border-[#10b981] shadow-xl relative scale-105 z-10 hover:translate-y-[-5px] hover:shadow-2xl transition-all">
                <div className="absolute top-[-15px] right-6 bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Best Value</div>
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Enterprise Batch</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 1,750</div>
                <p className="text-sm text-[#64748b] mb-8">50 documents (SGD 35 each)</p>
                <ul className="space-y-4 mb-8">
                  <li className="font-bold text-[#0f172a] text-sm">Everything in Small Batch, plus:</li>
                  {['Priority processing (< 1 hour)', 'Dashboard reporting', 'Webhook notifications', '12-month retention', 'Dedicated support'].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-bold text-[#10b981] mb-8">Save 49% vs single notarization</p>
                <button onClick={() => handleSelectPlan('batch50')} className="btn btn-primary w-full shadow-lg">
                  Select — SGD 1,750
                </button>
              </div>
            </div>
            )}

            {/* Step 2: Upload Document */}
            {step === 'upload' && (
              <div id="upload-section" className="max-w-2xl mx-auto">
                <div className="bg-white p-10 rounded-3xl border-2 border-[#10b981] shadow-xl">
                  <h3 className="text-2xl font-bold mb-2 text-[#0f172a]">Upload Your Document</h3>
                  <p className="text-[#64748b] mb-8">We&apos;ll compute a SHA-256 hash and store your file securely.</p>

                  {/* File input */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-[#0f172a] mb-2">Document File *</label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt,.csv,.xlsx"
                      className="w-full px-4 py-3 border-2 border-dashed border-[#cbd5e1] rounded-xl text-[#64748b] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#10b981] file:text-white file:font-semibold file:cursor-pointer hover:border-[#10b981] transition-colors"
                    />
                    <p className="text-xs text-[#94a3b8] mt-2">Supported: PDF, DOCX, PNG, JPG, TXT, CSV, XLSX — Max 50 MB</p>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-[#0f172a] mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-[#94a3b8] mt-1">Certificate will be sent to this email</p>
                  </div>

                  {/* Company Name (optional) */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-[#0f172a] mb-2">Company Name (optional)</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your Company Pte Ltd"
                      className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                    />
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                  )}

                  <div className="flex gap-4">
                    <button onClick={handleStartOver} className="px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#64748b] hover:bg-[#f8fafc] transition-colors">
                      ← Back
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 btn btn-primary py-3 shadow-lg disabled:opacity-50"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          Uploading & Hashing…
                        </span>
                      ) : 'Upload & Generate Hash'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Hash & Pay */}
            {step === 'checkout' && uploadResult && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white p-10 rounded-3xl border-2 border-[#10b981] shadow-xl">
                  <h3 className="text-2xl font-bold mb-6 text-[#0f172a]">Document Ready for Notarization</h3>

                  {/* Hash preview */}
                  <div className="bg-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0] mb-6">
                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">File</span>
                      <p className="text-[#0f172a] font-medium">{uploadResult.file_name} ({formatBytes(uploadResult.file_size)})</p>
                    </div>
                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">SHA-256 Hash</span>
                      <p className="font-mono text-sm text-[#10b981] break-all bg-white p-3 rounded-lg border border-dashed border-[#cbd5e1] mt-1">
                        {uploadResult.file_hash}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Package</span>
                      <p className="text-[#0f172a] font-bold">{PLANS[selectedPlan].label} — {PLANS[selectedPlan].price}</p>
                    </div>
                  </div>

                  {/* Post-payment pipeline */}
                  <div className="bg-[#f0fdf4] p-6 rounded-2xl border border-[#bbf7d0] mb-6">
                    <p className="text-sm font-bold text-[#065f46] mb-4">What happens after you pay:</p>
                    <ol className="relative border-l-2 border-[#86efac] ml-3 space-y-5">
                      {[
                        { icon: '💳', title: 'Payment confirmed', desc: 'Stripe securely processes your payment.' },
                        { icon: '⛓️', title: 'Hash anchored on Polygon', desc: 'Your SHA-256 hash is written to the Polygon blockchain, creating an immutable timestamp.' },
                        { icon: '📄', title: 'PDF certificate generated', desc: 'A notarization certificate with blockchain TX ID, timestamp, and QR verification code is created.' },
                        { icon: '📧', title: 'Certificate emailed to you', desc: `Sent to ${email} within minutes.` },
                      ].map((s, i) => (
                        <li key={i} className="ml-6">
                          <span className="absolute -left-[13px] flex items-center justify-center w-6 h-6 bg-[#10b981] rounded-full text-xs">
                            {s.icon}
                          </span>
                          <p className="text-sm font-semibold text-[#0f172a]">{s.title}</p>
                          <p className="text-xs text-[#475569]">{s.desc}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mb-6 p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                    <HardenedClickwrap onValidityChange={setConsentValid} variant="light" />
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                  )}

                  <div className="flex gap-4">
                    <button onClick={handleStartOver} className="px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#64748b] hover:bg-[#f8fafc] transition-colors">
                      ← Start Over
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={checkingOut || !consentValid}
                      className="flex-1 btn btn-primary py-3 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {checkingOut ? 'Redirecting to Payment…' : `Pay ${PLANS[selectedPlan].price} — Notarize Now`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-center mt-12 text-[#64748b]">
              Need 100+ documents per month? See <Link href="/enterprise" className="text-[#10b981] font-bold hover:underline">Enterprise Suite</Link> 
              (includes 5,000 notarizations/month).
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-white p-8 lg:p-16 rounded-[2.5rem] shadow-2xl border border-[#e2e8f0] mb-20">
            <h2 className="text-3xl font-black mb-12 text-[#0f172a]">How Blockchain Notarization Works</h2>
            
            <div className="space-y-12">
              {[
                { n: 1, t: 'Upload Document', d: 'Upload your PDF, image, or document file. We support: PDF, DOCX, PNG, JPG, TXT.' },
                { n: 2, t: 'Generate SHA-256 Hash', d: 'We create a unique cryptographic fingerprint of your document. Even 1-byte change would produce a completely different hash.', code: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7...' },
                { n: 3, t: 'Anchor to Polygon Blockchain', d: 'Hash is written to Polygon Amoy testnet (Layer 2 Ethereum). This creates an immutable, public timestamp that cannot be altered.', note: 'Why Polygon? Low cost (~ $0.01 per transaction), high security (Ethereum-backed), and public verifiability. Currently on Amoy testnet.' },
                { n: 4, t: 'Receive Certificate + QR Code', d: 'You get a notarization certificate (PDF) with:', list: ['Document hash', 'Blockchain transaction ID', 'Timestamp (SGT)', 'Polygonscan verification URL', 'QR code for mobile scanning'] },
                { n: 5, t: 'Independent Verification', d: 'Anyone can verify your notarization on Polygonscan.com or via our public verification portal. No login required.' }
              ].map((item) => (
                <div key={item.n} className="flex gap-8">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">{item.n}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3 text-[#0f172a]">{item.t}</h3>
                    <p className="text-[#64748b] leading-relaxed mb-4">{item.d}</p>
                    {item.code && <div className="p-4 bg-[#f8fafc] rounded-lg font-mono text-sm text-[#94a3b8] break-all border border-dashed border-[#cbd5e1]">{item.code}</div>}
                    {item.note && <p className="text-sm font-bold text-[#10b981]">{item.note}</p>}
                    {item.list && (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {item.list.map((li, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-[#64748b]">
                            <span className="text-[#10b981]">✓</span> {li}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-[#f8fafc] p-12 lg:p-24 rounded-[3rem] mb-20 border border-[#e2e8f0]">
            <h2 className="text-3xl font-black mb-12 text-[#0f172a]">Common Use Cases</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { t: '📋 Compliance Documentation', d: 'Notarize privacy policies, DPO appointment letters, PDPA audit reports, or data breach notifications.' },
                { t: '📝 Contracts & Agreements', d: 'Timestamp employment contracts, NDAs, vendor agreements, or terms of service before signing.' },
                { t: '🔒 IP Protection', d: 'Prove creation date for patents, trademarks, copyrights, or trade secret documentation.' },
                { t: '📊 Financial Records', d: 'Notarize invoices, financial statements, audit reports for regulatory compliance.' },
                { t: '🏢 Corporate Governance', d: 'Board resolutions, shareholder agreements, director appointment letters, AGM minutes.' },
                { t: '🔬 Research Data', d: 'Clinical trial results, research findings, lab reports with immutable timestamps.' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border-l-4 border-[#10b981] shadow-sm hover:translate-y-[-5px] transition-all">
                  <h4 className="font-bold mb-3 text-[#0f172a]">{item.t}</h4>
                  <p className="text-sm text-[#64748b] leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white p-8 lg:p-16 rounded-[2.5rem] shadow-2xl border border-[#e2e8f0] mb-20">
            <h2 className="text-3xl font-black mb-12 text-[#0f172a]">Technical Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { l: 'Hashing Algorithm:', v: 'SHA-256 (FIPS 180-4)' },
                { l: 'Blockchain Network:', v: 'Polygon Amoy Testnet' },
                { l: 'Timestamp Precision:', v: 'Block timestamp (± 30 seconds)' },
                { l: 'File Size Limit:', v: '50 MB per file' },
                { l: 'Supported Formats:', v: 'PDF, DOCX, XLSX, PNG, JPG, TXT, CSV, ZIP' },
                { l: 'Processing Time:', v: '2-5 minutes (standard) | < 1 hour (enterprise batch)' },
                { l: 'Retention Period:', v: '12 months (single/enterprise) | 3 months (batch10)' },
                { l: 'Verification:', v: 'Public via Polygonscan or BOOPPA verify portal' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <span className="font-bold text-[#0f172a]">{item.l}</span>
                  <span className="text-sm text-[#64748b]">{item.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="bg-[#fffbeb] p-12 rounded-[2rem] border-2 border-[#fef3c7]">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-[#92400e]">⚖️ Court Admissibility in Singapore</h3>
            <p className="text-[#92400e] mb-8 font-medium">Under Singapore Evidence Act (Section 35), electronic records are admissible if their authenticity can be established. Blockchain timestamps provide:</p>
            
            <ul className="space-y-4 mb-8">
              {[
                'Cryptographic proof of document existence at specific date/time',
                'Tamper-evident — any modification changes the hash',
                'Independently verifiable — third parties can confirm without trusting BOOPPA',
                'Immutable public record — blockchain ledger cannot be altered retroactively'
              ].map((li, i) => (
                <li key={i} className="flex items-center gap-3 text-[#92400e] font-medium">
                  <span className="font-bold text-[#d97706]">✓</span> {li}
                </li>
              ))}
            </ul>

            <div className="bg-white/50 p-8 rounded-2xl border border-[#fde68a]">
              <h4 className="font-black text-[#92400e] mb-4 uppercase tracking-wider text-sm">Important Legal Note</h4>
              <p className="text-sm text-[#92400e] leading-relaxed">
                Blockchain notarization provides <strong>evidence of timestamp and integrity</strong>. 
                It does NOT constitute legal notarization by a licensed notary public, 
                nor does it validate the content or legality of the document. 
                For legal matters, consult qualified legal counsel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[3rem] p-12 lg:p-24 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#10b981] opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">Ready to Notarize Your Documents?</h2>
            <p className="text-white/70 text-xl mb-12 max-w-2xl mx-auto font-medium">Get immutable, blockchain-anchored timestamps in minutes.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={() => { handleStartOver(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn btn-primary px-10 py-5 text-xl font-bold">Notarize a Document Now</button>
              <Link href="/pricing" className="btn btn-secondary bg-white text-[#0f172a] px-10 py-5 text-xl font-bold hover:bg-white/90 border-0 transition-colors">View All Packages</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
