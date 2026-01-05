import React from 'react';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata = {
  title: 'FAQ | BOOPPA – Compliance & Evidence',
  description: 'Frequently asked questions about BOOPPA PDPA compliance, evidence generation, and notarization.',
};

export default function FAQPage() {
  return (
    <main className="pt-16 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-white mb-6">Frequently Asked Questions</h1>
        <h2 className="text-2xl font-semibold text-white mb-8">BOOPPA PDPA Compliance & Evidence Cycle</h2>

        <FAQAccordion />
      </div>
    </main>
  );
}
