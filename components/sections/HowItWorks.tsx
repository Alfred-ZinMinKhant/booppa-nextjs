import { Upload, Link, FileText, Download } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { icon: Upload, title: '1. Upload & Scan', desc: 'Enter your site URL or upload document; we generate secure hashes (SHA-256) and metadata.' },
    { icon: Link, title: '2. Polygon Notarization', desc: 'Immutable record created on Polygon blockchain with timestamp and transaction ID.' },
    { icon: FileText, title: '3. Generate Evidence Pack', desc: 'Receive full package: original data, hashes, Polygon proofs, chain-of-custody logs.' },
    { icon: Download, title: '4. Download & Verify', desc: 'Instant QR-verifiable report, designed for audits and court use (subject to judicial acceptance).' },
    { icon: FileText, title: '5. AI-Enhanced Insights', desc: 'Generate intelligent audit narratives and risk summaries using advanced AI – fully PDPA-compliant (no personal data used for training).' },
  ];

  return (
    <section className="py-20 bg-gray-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black mb-12 text-white">How It Works – In 30 Seconds</h2>
        <div className="grid md:grid-cols-5 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
              <step.icon className="w-12 h-12 mx-auto mb-4 text-booppa-green" />
              <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-500 mt-8 italic text-sm">
          Powered by Polygon Blockchain for scalable, verifiable immutability.
        </p>
      </div>
    </section>
  );
}
