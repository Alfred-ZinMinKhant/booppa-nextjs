
"use client";
import { useEffect } from 'react';


const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ||
  'https://calendly.com/evidence-booppa/booppa-compliance-demo?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=10b981';

export default function DemoPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Book a Live Demo</h1>
        <p className="text-gray-400 text-center mb-8">Select a time slot below to schedule a live walkthrough with our team. We look forward to showing you how BOOPPA can help your business!</p>
        <div
          className="calendly-inline-widget"
          data-url={CALENDLY_URL}
          style={{ minWidth: '320px', height: '700px' }}
        ></div>
      </div>
    </main>
  );
}
