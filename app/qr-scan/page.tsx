'use client';

import { useState } from 'react';
import { Lock, Shield, AlertTriangle, FileText, Scale } from 'lucide-react';

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
  screenshot?: string;
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

  const LockedDetailSection = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/95 to-gray-900 backdrop-blur-md z-10 flex items-center justify-center rounded-xl">
        <div className="text-center p-6">
          <Lock className="w-10 h-10 text-teal-500 mx-auto mb-3" />
          <p className="text-white font-semibold mb-3">Upgrade to See Full Details</p>
          <a
            href="/pdpa/quick-scan"
            className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:from-teal-600 hover:to-emerald-600 transition shadow-lg"
          >
            Get PRO Report – S$69
          </a>
        </div>
      </div>
      <div className="filter blur-sm select-none pointer-events-none opacity-40">
        {children}
      </div>
    </div>
  );

  const getRiskLevel = (score?: number) => {
    if (!score) return 'UNKNOWN';
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 py-12">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        {!result && (
          <div className="text-center mb-8">
            <div className="inline-block bg-teal-500/20 border border-teal-500 rounded-full px-6 py-2 mb-4">
              <span className="text-teal-400 font-semibold">⚡ Free Instant Scan</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Free PDPA Compliance Scan
            </h1>
            <p className="text-gray-400">
              Basic web scan with AI analysis • Upgrade for full PDF report & blockchain proof
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl backdrop-blur-sm overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-16 px-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg className="animate-spin w-24 h-24 text-teal-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Website...</h2>
              <p className="text-gray-400">Running AI compliance scan • Takes about 20 seconds</p>
            </div>
          )}

          {/* Results State */}
          {!loading && result && (
            <div>
              {/* Report Header */}
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 p-8 border-b border-gray-700">
                <h1 className="text-3xl font-bold text-white mb-2">PDPA Compliance Scan Report</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span>{formData.company_name || formData.website_url}</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="text-teal-400">FREE TIER</span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Screenshot */}
                {result.screenshot && (
                  <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Website Screenshot</h2>
                    <img 
                      src={`data:image/png;base64,${result.screenshot}`} 
                      alt="Website"
                      className="w-full rounded-xl border border-gray-700 shadow-lg"
                    />
                  </section>
                )}

                {/* Risk Assessment - UNLOCKED */}
                {typeof result.ai_summary !== 'string' && result.ai_summary?.risk_score !== undefined && (
                  <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Shield className="w-6 h-6 text-teal-400" />
                      <h2 className="text-2xl font-bold text-white">Risk Assessment</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`text-6xl font-black mb-2 ${getRiskColor(result.ai_summary.risk_score)}`}>
                          {result.ai_summary.risk_score}
                        </div>
                        <div className="text-sm text-gray-400">Risk Score</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-2 ${getRiskColor(result.ai_summary.risk_score)}`}>
                          {getRiskLevel(result.ai_summary.risk_score)}
                        </div>
                        <div className="text-sm text-gray-400">Risk Level</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-2 text-gray-300">
                          {typeof result.ai_summary !== 'string' && result.ai_summary?.summary}
                        </div>
                        <div className="text-sm text-gray-400">Status</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            result.ai_summary.risk_score >= 70 ? 'bg-red-500' : 
                            result.ai_summary.risk_score >= 40 ? 'bg-orange-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${result.ai_summary.risk_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500 text-center">
                      AI Model: Booppa Template Engine
                    </div>
                  </section>
                )}

                {/* Executive Summary - LOCKED */}
                <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-gray-400" />
                    <h2 className="text-2xl font-bold text-white">Executive Summary</h2>
                  </div>
                  
                  <LockedDetailSection>
                    <div className="space-y-3 text-gray-300">
                      <p>BOOPPA COMPLIANCE AUDIT REPORT - EXECUTIVE SUMMARY</p>
                      <p>Overall Risk Level: MEDIUM (Monitor and plan fixes)</p>
                      <p>This audit identified 3 compliance issues requiring attention:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>CRITICAL violations: 0 (require immediate action)</li>
                        <li>HIGH severity violations: 1 (urgent attention within 7 days)</li>
                        <li>MEDIUM/LOW violations: 2 (address within 30 days)</li>
                      </ul>
                      <p className="font-semibold mt-4">RECOMMENDED IMMEDIATE ACTIONS:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li>Address all CRITICAL violations within 24-48 hours</li>
                        <li>Develop compliance action plan with clear deadlines</li>
                        <li>Document all corrective measures</li>
                      </ol>
                    </div>
                  </LockedDetailSection>
                </section>

                {/* Detailed Findings - LOCKED */}
                <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-gray-400" />
                    <h2 className="text-2xl font-bold text-white">Detailed Findings</h2>
                  </div>
                  
                  <LockedDetailSection>
                    <div className="space-y-4">
                      <div className="border-l-4 border-orange-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded">MEDIUM</span>
                          <span className="text-white font-semibold">Marketing violation</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          MEDIUM VIOLATION: No mention of DNC Registry compliance for marketing communications
                        </p>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>Legislation: PDPA General Provisions</p>
                          <p>Penalty: Up to S$1,000,000</p>
                          <p>Evidence: DNC Registry not referenced</p>
                        </div>
                      </div>
                    </div>
                  </LockedDetailSection>
                </section>

                {/* Recommendations - LOCKED */}
                <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-gray-400" />
                    <h2 className="text-2xl font-bold text-white">Recommendations</h2>
                  </div>
                  
                  <LockedDetailSection>
                    <div className="space-y-3">
                      <div className="border-l-4 border-teal-500 pl-4">
                        <p className="text-white font-semibold mb-2">marketing violation • MEDIUM</p>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          <li>Review compliance requirements</li>
                          <li>Consult relevant guidelines</li>
                          <li>Implement corrective measures</li>
                          <li>Document compliance actions</li>
                        </ul>
                        <p className="text-xs text-gray-400 mt-2">Timeline: 7 days for initial action</p>
                      </div>
                    </div>
                  </LockedDetailSection>
                </section>

                {/* Legal References - LOCKED */}
                <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className="w-6 h-6 text-gray-400" />
                    <h2 className="text-2xl font-bold text-white">Legal References</h2>
                  </div>
                  
                  <LockedDetailSection>
                    <div className="space-y-2">
                      <a href="#" className="block text-teal-400 hover:underline">Personal Data Protection Act 2012</a>
                      <a href="#" className="block text-teal-400 hover:underline">PDPA Advisory Guidelines</a>
                      <a href="#" className="block text-teal-400 hover:underline">Do Not Call Registry Provisions</a>
                    </div>
                  </LockedDetailSection>
                </section>

                {/* Upgrade CTA */}
                <section className="bg-gradient-to-r from-teal-900/30 to-emerald-900/30 rounded-2xl p-8 border-2 border-teal-500 text-center">
                  <Lock className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Unlock Full Compliance Report</h3>
                  <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                    Get the complete PDF report with detailed findings, specific recommendations, legal references, blockchain notarization, and court-admissible proof.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="/pdpa/quick-scan"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition shadow-lg"
                    >
                      <Shield className="w-5 h-5" />
                      Get PRO Report – S$69
                    </a>
                    <button
                      onClick={() => {
                        setResult(null);
                        setFormData({ website_url: '', company_name: '', email: '' });
                      }}
                      className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                    >
                      Scan Another Website
                    </button>
                  </div>
                </section>

                {/* Email Notice */}
                <div className="bg-teal-900/20 border border-teal-700 rounded-xl p-4 text-center">
                  <p className="text-teal-300 text-sm">
                    ✉️ Basic scan summary sent to <strong>{formData.email}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form State */}
          {!loading && !result && (
            <div className="p-8">
              {error && (
                <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto">
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
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-4 rounded-lg text-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition transform hover:scale-[1.02] shadow-lg"
                >
                  ⚡ Get Free Compliance Scan
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Info Footer */}
        {!result && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              🤖 AI-Powered Analysis • ⚡ Results in ~20 seconds • 🎁 Upgrade for complete PDF & blockchain proof
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
