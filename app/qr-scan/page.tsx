'use client';

import { useState } from 'react';

export default function QRScanPage() {
  const [formData, setFormData] = useState({ website_url: '', company_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/qr-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok && res.headers.get('content-type')?.includes('application/pdf')) {
      // Download the PDF file
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
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-2 text-center">Free Instant PDPA Scan</h1>
        <p className="text-gray-600 mb-6 text-center">Get your personalized report with blockchain proof in 20 seconds.</p>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4 qr-scan-form">
            <input
              type="url"
              required
              placeholder="Website URL (required)"
              className="w-full border rounded px-3 py-2 placeholder-gray-400"
              style={{ color: formData.website_url ? '#111827' : undefined }}
              value={formData.website_url}
              onChange={e => setFormData({ ...formData, website_url: e.target.value })}
            />
            <input
              type="text"
              placeholder="Company Name (optional)"
              className="w-full border rounded px-3 py-2 placeholder-gray-400"
              style={{ color: formData.company_name ? '#111827' : undefined }}
              value={formData.company_name}
              onChange={e => setFormData({ ...formData, company_name: e.target.value })}
            />
            <input
              type="email"
              required
              placeholder="Email (required)"
              className="w-full border rounded px-3 py-2 placeholder-gray-400"
              style={{ color: formData.email ? '#111827' : undefined }}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Get Free Scan'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-700 mb-2">Report Sent!</h2>
            <p className="mb-4">Check your email – includes blockchain proof + fix option.</p>
            <a
              href="/sme"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition"
            >
              Fix All Issues – SGD 69
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
