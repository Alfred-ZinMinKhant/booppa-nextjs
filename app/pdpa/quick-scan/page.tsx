"use client"

import { useState } from "react";

export default function QuickScanPage() {
  const [website, setWebsite] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!website) {
      alert("Website is required for the Quick Scan");
      return;
    }

    try {
      setLoading(true);
      const reportRes = await fetch(`${apiBase}/api/reports/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework: "pdpa_quick_scan", company_name: company || "Quick Scan", website: website, assessment_data: { contact_email: email }, contact_email: email }),
      });

      if (!reportRes.ok) {
        const text = await reportRes.text();
        throw new Error(`Failed to create report: ${text}`);
      }

      const { report_id } = await reportRes.json();

      const checkoutRes = await fetch(`${apiBase}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: "pdpa_quick_scan", reportId: report_id, customerEmail: email }),
      });

      if (!checkoutRes.ok) {
        const text = await checkoutRes.text();
        throw new Error(`Failed to start checkout: ${text}`);
      }

      const { url } = await checkoutRes.json();
      window.location.href = url;
    } catch (err: any) {
      alert(err.message || "Failed to start quick scan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-900 rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-4">PDPA Quick Scan</h1>
        <p className="text-gray-400 mb-6">Provide your website and contact details to start a one-time PDPA quick scan (SGD 69).</p>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-gray-300 mb-1">Website URL</label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="w-full mb-3 p-2 rounded bg-gray-800 border border-gray-700 text-white" />

          <label className="block text-sm text-gray-300 mb-1">Company name (optional)</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company Ltd" className="w-full mb-3 p-2 rounded bg-gray-800 border border-gray-700 text-white" />

          <label className="block text-sm text-gray-300 mb-1">Contact email (optional)</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700 text-white" />

          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 rounded bg-green-500 text-white" disabled={loading}>{loading ? 'Starting...' : 'Start Quick Scan & Checkout'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
