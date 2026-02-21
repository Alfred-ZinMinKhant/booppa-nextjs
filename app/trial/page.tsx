"use client";

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Building, Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendorTrial() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    uen: '',
    industry: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In full implementation, this hits the backend API
      const response = await fetch('/api/vendor/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      // Simulate successful onboarding
      setTimeout(() => {
        setStep(3);
        setIsSubmitting(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            Secure Your Vendor Score
          </h2>
          <p className="text-neutral-400">
            Join the decentralized compliance network for enterprises.
          </p>
        </div>

        <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm">
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Work Email
                  </label>
                  <input 
                    placeholder="you@company.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    type="email"
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm md:text-sm bg-neutral-900 border-neutral-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setStep(2)}
                  disabled={!formData.email}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Company Name
                  </label>
                  <input 
                    placeholder="e.g. Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm md:text-sm bg-neutral-900 border-neutral-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Company UEN / Registration No.
                  </label>
                  <input 
                    placeholder="Optional for international"
                    value={formData.uen}
                    onChange={(e) => setFormData({...formData, uen: e.target.value})}
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm md:text-sm bg-neutral-900 border-neutral-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border h-10 px-4 py-2 w-1/3 bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 w-2/3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.company}
                  >
                    {isSubmitting ? 'Processing...' : 'Start Trial'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-6 py-4">
                <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">Account Created</h3>
                  <p className="text-sm text-neutral-400">
                    We've emailed your temporary password. You can now access your dashboard.
                  </p>
                </div>
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push('/vendor/dashboard')}
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feature Context */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
            <Shield className="h-5 w-5 text-blue-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">Blockchain Anchored</h4>
            <p className="text-xs text-neutral-400">Proofs are mathematically verifiable by procurement.</p>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
            <Building className="h-5 w-5 text-emerald-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">Enterprise Visibility</h4>
            <p className="text-xs text-neutral-400">Get discovered by organizations running vendor assessments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
