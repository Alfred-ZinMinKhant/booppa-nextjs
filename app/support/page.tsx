"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.booppa.io";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ ticketId: string; trackingUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/tickets/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          category,
          subject,
          message,
          honeypot,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || "Unable to submit ticket");
      }

      setSuccess({ ticketId: data.ticket_id, trackingUrl: data.tracking_url });
      setName("");
      setEmail("");
      setCategory("");
      setSubject("");
      setMessage("");
      setHoneypot("");
    } catch (err: any) {
      setError(err?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white min-h-screen py-24 px-6 text-[#0f172a]">
      <div className="container max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-black mb-6">Support Center</h1>
          <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
            Get help with BOOPPA services. We respond within 24 hours (4 hours for Enterprise customers).
          </p>
        </div>

        <div className="bg-white p-8 lg:p-16 rounded-[3rem] shadow-2xl border border-[#e2e8f0] mb-12">
          {success ? (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center text-white text-4xl mb-8 mx-auto shadow-lg shadow-[#10b981]/20">
                ✓
              </div>
              <h2 className="text-3xl font-black mb-4 text-[#0f172a]">Ticket Submitted</h2>
              <p className="text-[#64748b] text-lg mb-8">
                Your ticket <strong className="text-[#0f172a]">{success.ticketId}</strong> has been created. We'll respond to your email shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href={success.trackingUrl} 
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary px-10 py-4 font-bold"
                >
                  Track Status
                </a>
                <button 
                  onClick={() => setSuccess(null)}
                  className="btn btn-outline border-[#0f172a] text-[#0f172a] px-10 py-4 font-bold rounded-2xl hover:bg-[#0f172a] hover:text-white transition-all"
                >
                  Open Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black mb-10">Open Support Ticket</h2>
              {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0f172a] ml-1">Full Name *</label>
                    <input
                      className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none transition-all"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0f172a] ml-1">Business Email *</label>
                    <input
                      className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none transition-all"
                      type="email"
                      placeholder="your@company.sg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0f172a] ml-1">Category *</label>
                    <select
                      className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none appearance-none transition-all"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select category...</option>
                      <option value="Technical">Technical Support</option>
                      <option value="Billing">Billing & Payments</option>
                      <option value="Partnership">Partnership Inquiry</option>
                      <option value="General">General Inquiry</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0f172a] ml-1">Subject *</label>
                    <input
                      className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none transition-all"
                      placeholder="Brief description of issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0f172a] ml-1">Message *</label>
                  <textarea
                    className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none transition-all resize-none font-sans"
                    rows={6}
                    placeholder="Please provide details about your request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <input
                  className="hidden"
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full py-5 text-xl font-black shadow-lg shadow-[#10b981]/20 disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Submit Support Ticket"}
                  </button>
                  <p className="text-center text-[#94a3b8] text-sm mt-4 font-medium italic">
                    Response time: 24 hours (standard) | 4 hours (Enterprise)
                  </p>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="bg-[#f8fafc] p-10 lg:p-16 rounded-[3rem] border border-[#e2e8f0] mb-12">
          <h2 className="text-3xl font-black mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              { q: 'How long does a PDPA scan take?', a: 'Typically 10-15 minutes. You\'ll receive the report via email with blockchain verification link.' },
              { q: 'Can I get a refund?', a: 'Yes. If we\'re unable to scan your website due to technical issues, we offer full refunds within 7 days.' },
              { q: 'Is this PDPC-approved?', a: 'No. We provide technical evidence and documentation tools. We are not a regulatory body.' },
              { q: 'How do I verify a hash?', a: 'Visit our Verify page and enter the hash, or scan the QR code on your report.' },
              { q: 'Enterprise contracts?', a: 'Yes. For 100+ scans/month or API access, book an enterprise demo.' },
              { q: 'Where is data stored?', a: 'All reports are on AWS Singapore (ap-southeast-1) with AES-256 encryption.' }
            ].map((faq, i) => (
              <div key={i}>
                <h4 className="text-lg font-bold mb-3 tracking-tight">{faq.q}</h4>
                <p className="text-[#64748b] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
