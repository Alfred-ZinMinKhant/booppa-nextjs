'use client';

import { useState } from 'react';
import { Lock, Shield, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

interface ScanResult {
  message: string;
  ai_summary?: {
    summary?: string;
    recommendation?: string;
    detected_laws?: string[];
    risk_score?: number;
  } | string;
  company_name?: string;
  website_url?: string;
  scan_date?: string;
  screenshot?: string; // Base64 screenshot
  screenshot_error?: string;
}

export default function QRScanPage() {
  const [formData, setFormData] = useState({ website_url: '', company_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    
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

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Failed to generate scan' }));
        setError(errorData.detail || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const LockedSection = ({ title, icon: Icon }: { title: string; icon: any }) => (
    <div className="relative bg-gray-900/50 border border-gray-700 rounded-xl p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/80 to-gray-900 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-12 h-12 text-teal-500 mx-auto mb-3" />
          <p className="text-white font-semibold mb-2">Upgrade to See Details</p>
          <a
            href="/pdpa/quick-scan"
            className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-teal-600 hover:to-emerald-600 transition"
          >
            Get PRO Scan – S$69
          </a>
        </div>
      </div>
      <div className="filter blur-sm select-none pointer-events-none">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        {!result && (
          <div className="text-center mb-8 mt-8">
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
        )}

        {/* Main Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg className="animate-spin w-24 h-24 text-teal-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Website...</h2>
              <p className="text-gray-400">Running AI compliance scan • This takes about 20 seconds</p>
            </div>
          )}

          {/* Results State */}
          {!loading && result && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center pb-6 border-b border-gray-700">
                <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Free Scan Complete!
                </h2>
                <p className="text-gray-400">
                  {formData.company_name || formData.website_url} • {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Screenshot */}
              {result.screenshot && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Website Screenshot</h3>
                  <img 
                    src={`data:image/png;base64,${result.screenshot}`} 
                    alt="Website screenshot"
                    className="w-full rounded-lg border border-gray-700"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {/* Risk Score - Unlocked */}
                {typeof result.ai_summary !== 'string' && result.ai_summary?.risk_score !== undefined && (
                  <div className="md:col-span-2 bg-gray-900/50 border border-gray-600 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-teal-400" />
                      Risk Assessment
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold text-orange-400">
                        {result.ai_summary.risk_score}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-2">Compliance Risk Score</div>
                        <div className="h-4 bg-gray-700 rounded-full">
                          <div 
                            className={`h-4 rounded-full ${result.ai_summary.risk_score > 70 ? 'bg-red-500' : result.ai_summary.risk_score > 40 ? 'bg-orange-500' : 'bg-green-500'}`}
                            style={{ width: `${result.ai_summary.risk_score}%` }}
                          />
                        </div>
                        <p className="text-gray-400 text-sm mt-2">
                          {typeof result.ai_summary !== 'string' && result.ai_summary?.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Locked Sections */}
                <LockedSection title="Detailed Findings" icon={AlertTriangle} />
                <LockedSection title="AI Recommendations" icon={FileText} />
                <LockedSection title="Legal References" icon={Shield} />
                <LockedSection title="Blockchain Evidence" icon={Lock} />
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-r from-teal-900/30 to-emerald-900/30 rounded-2xl p-8 border-2 border-teal-500 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Want the Full Report?</h3>
                <p className="text-gray-300 mb-6">
                  Get comprehensive PDF report with full DeepSeek AI analysis, blockchain notarization, and court-admissible proof.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/pdpa/quick-scan"
                    className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition text-center"
                  >
                    Upgrade to PRO – S$69
                  </a>
                  <button
                    onClick={() => {
                      setResult(null);
                      setFormData({ website_url: '', company_name: '', email: '' });
                    }}                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                  >
                    Scan Another Website
                  </button>
                </div>
              </div>

              {/* Email Confirmation */}
              <div className="bg-teal-900/20 border border-teal-700 rounded-xl p-4 text-center">
                <p className="text-teal-300 text-sm">
                  ✉️ Free scan summary also sent to <strong>{formData.email}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Form State */}
          {!loading && !result && (
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
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition transform hover:scale-[1.02]"
                >
                  ⚡ Get Free Scan
                </button>
              </form>
            </>
          )}
        </div>

        {/* Info Footer */}
        {!result && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              🤖 Light AI Analysis • ⚡ Results in 20 seconds • 🎁 Upgrade for PDF & blockchain
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
