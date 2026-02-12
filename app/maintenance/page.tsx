'use client';

import React from 'react';

export default function Maintenance() {
  return (
    <main className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10b981] opacity-10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600 opacity-10 rounded-full blur-[120px]"></div>
      
      <div className="relative z-10 max-w-2xl w-full mx-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 lg:p-16 text-center shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10b981]/10 rounded-2xl mb-8">
            <svg 
              className="w-10 h-10 text-[#10b981]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Under Maintenance
          </h1>
          
          <p className="text-white/70 text-lg lg:text-xl mb-12 leading-relaxed">
            We are currently upgrading our systems to provide you with better blockchain compliance evidence tools. We'll be back shortly.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 pt-8 border-t border-white/10">
            <div className="text-center">
              <span className="block text-xs font-bold uppercase tracking-widest text-[#10b981] mb-2">Support</span>
              <a href="mailto:support@booppa.io" className="text-white hover:text-[#10b981] transition-colors font-medium">
                support@booppa.io
              </a>
            </div>
          </div>
        </div>

        {/* Brand Link */}
        <div className="mt-12 text-center">
          <div className="text-2xl font-black text-white tracking-widest uppercase">
            BOOPPA
          </div>
          <div className="text-[#10b981] text-[10px] font-bold tracking-[0.2em] uppercase mt-2">
            Blockchain Compliance Infrastructure
          </div>
        </div>
      </div>
    </main>
  );
}
