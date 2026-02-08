'use client';

import { useState } from 'react';

export default function QRScanPage() {
  const [formData, setFormData] = useState({ website_url: '', company_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    // Add https:// if no protocol specified
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const normalizedUrl = normalizeUrl(formData.website_url);
    
    const base = process.env.NEXT_PUBLIC_API_BASE || '';
    try {
      const res = await fetch(`${base}/api/qr-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          website_url: normalizedUrl
        }),
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Booppa-PDPA-Scan.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setSuccess(true);
      } else if (res.ok) {
        setSuccess(true);
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Failed to generate scan' }));
        setError(errorData.detail || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-teal-500/20 border border-teal-500 rounded-full px-6 py-2 mb-4">
            <span className="text-teal-400 font-semibold">⚡ Free Instant Scan</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Free PDPA Compliance Scan
          </h1>
          <p className="text-gray-400">
            Basic web scan with AI analysis • Upgrade for PDF & blockchain proof
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
          {!success ? (
            <>
              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Website URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="example.com or https://example.com"
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    value={formData.website_url}
                    onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Enter your website domain (protocol optional)
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Company Name <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your Company Name"
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    value={formData.company_name}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Limited to one free scan per month per email
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating Report...
                    </span>
                  ) : (
                    '⚡ Get Free Scan'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Report Sent!
                </h2>
                <p className="text-gray-400 mb-6">
                  Check your email for your free AI compliance summary
                </p>
              </div>
              
              <a
                href="/sme"
                className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition transform hover:scale-[1.02]"
              >
                Fix All Issues – SGD 69
              </a>
              
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({ website_url: '', company_name: '', email: '' });
                }}
                className="block w-full mt-4 text-gray-400 hover:text-white transition"
              >
                Scan Another Website
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            🤖 Light AI Analysis • ⚡ Results in 20 seconds • 🎁 Upgrade for PDF & blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
