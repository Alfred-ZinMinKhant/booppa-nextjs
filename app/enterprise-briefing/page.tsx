"use client";

import React, { useState } from 'react';
import { ArrowRight, FileText, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

export default function EnterpriseBriefing() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  
  const handleEmailSubmit = () => {
    // Extract domain to personalize the next step
    if (email.includes('@')) {
      const parts = email.split('@');
      setDomain(parts[1]);
      setStep(2);
    }
  };
  
  const handleSubmit = () => {
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl mb-4">
            Auditor-Proof Vendor Compliance
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Get instant access to blockchain-anchored compliance dossiers. Stop waiting weeks for security questionnaires.
          </p>
        </div>

        {step === 1 && (
          <div className="rounded-lg bg-card text-card-foreground border-2 border-neutral-100 shadow-xl max-w-xl mx-auto w-full">
            <div className="p-6 pt-8 pb-8 px-8 flex flex-col items-center text-center">
              <ShieldCheck className="h-12 w-12 text-blue-600 mb-6" />
              <h3 className="text-2xl font-semibold mb-2">Request Agency Access</h3>
              <p className="text-neutral-500 mb-8">
                Enter your work or government email to securely request intelligence on your prospective vendors.
              </p>
              
              <div className="w-full flex space-x-2">
                <input 
                  placeholder="name@agency.gov.sg" 
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  className="flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-12 text-lg text-black bg-white"
                  type="email"
                />
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={!email.includes('@')}
                  onClick={handleEmailSubmit}
                >
                  Continue
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-4 text-left w-full">
                By continuing, you agree to our Terms of Service for enterprise and government agencies.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-lg bg-card text-card-foreground border-2 border-neutral-100 shadow-xl max-w-xl mx-auto w-full">
            <div className="p-6 pt-8 pb-8 px-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <BuildingIcon className="mr-2 h-5 w-5 text-neutral-400" />
                Customize Briefing for {domain}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Target Vendor Domains (Comma separated)</label>
                  <textarea 
                    className="w-full h-24 p-3 border border-neutral-200 rounded-md text-sm text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. acmecorp.com, vendor2.sg"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Compliance Standard Required</label>
                  <select className="w-full p-3 border border-neutral-200 rounded-md text-black bg-white">
                    <option>ISO 27001</option>
                    <option>SOC 2 Type II</option>
                    <option>PDPA Readiness</option>
                    <option>Cyber Essentials</option>
                  </select>
                </div>
                
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm px-4 py-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex w-full h-12 bg-blue-600 hover:bg-blue-700 mt-6 text-white font-medium"
                  onClick={handleSubmit}
                >
                  Generate Dossier Request
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 max-w-lg mx-auto py-12">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">Request Sent Securely</h3>
            <p className="text-neutral-500">
              We've notified the targeted vendors. When their blockchain-anchored compliance proof is ready, a secure review link will be sent to <strong>{email}</strong>.
            </p>
            <div className="pt-8">
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                onClick={() => setStep(1)}
              >
                Submit Another Request
              </button>
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-neutral-100">
          <div>
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-medium text-neutral-900 mb-2">Immutable Audit Trails</h4>
            <p className="text-neutral-500 text-sm">Every piece of evidence is anchored to the blockchain, ensuring it cannot be tampered with post-submission.</p>
          </div>
          <div>
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-100 text-emerald-600 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-medium text-neutral-900 mb-2">Automated Extraction</h4>
            <p className="text-neutral-500 text-sm">Our AI parses complex SOC 2 and ISO reports into actionable compliance scores in seconds.</p>
          </div>
          <div>
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-medium text-neutral-900 mb-2">Secure Delivery</h4>
            <p className="text-neutral-500 text-sm">Dossiers are delivered via secure, expiring links tailored for enterprise security teams.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple building icon component to avoid extra imports if Building isn't in lucide-react export used
const BuildingIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
)
