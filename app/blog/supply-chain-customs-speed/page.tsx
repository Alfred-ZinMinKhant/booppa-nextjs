import Image from 'next/image';
import Link from 'next/link';

export default function SupplyChainCustomsSpeed() {
  return (
    <main className="min-h-screen bg-black text-white py-12">
      <section className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6">Solving Singapore Customs Delays with Blockchain Document Verification</h1>
        <p className="text-gray-300 mb-6"><strong>SEO Focus:</strong> Singapore customs clearance, blockchain logistics, digital certificate of origin, trade compliance.</p>

        <div className="mb-8">
          <div className="w-full h-72 relative rounded overflow-hidden">
            <Image src="/4-QR_Container.jpg" alt="QR Container verification" fill className="object-cover" />
          </div>
        </div>

        <article className="prose prose-invert max-w-none text-gray-200">
          <p>In the high-stakes world of global logistics, a 48-hour customs delay isn't just an inconvenience—it’s a margin killer. In Singapore, the push towards TradeNet 3.0 and digital trade documents has opened a massive opportunity for companies to cut clearance times from days to minutes.</p>

          <h3>The Paperwork Bottleneck</h3>
          <p>The majority of customs delays at Singapore’s ports are not caused by physical inspections, but by documentary discrepancies. Traditional paper-based Certificates of Origin and Bills of Lading are:</p>
          <ul>
            <li>Prone to tampering: Increasing the need for manual verification.</li>
            <li>Slow to verify: Requiring physical couriers or complex bank chains.</li>
            <li>Expensive: Costing companies an average of SGD 450,000 annually in administrative friction.</li>
          </ul>

          <h3>The Booppa Solution: Instant Verification</h3>
          <p>By notarizing shipping documents on the Polygon blockchain via Booppa, logistics providers can offer customs officers an immutable "Single Source of Truth."</p>

          <p>A simple scan of a QR code linked to a Booppa-verified hash allows customs to instantly confirm the document’s authenticity, provenance, and integrity. One of our partners recently reduced their average clearance delay from 48 hours to just 30 minutes.</p>

          <hr />

          <h3>Ready to Speed Up Your Logistics?</h3>
          <p>Don’t lose another container to paperwork. Secure your documents today—immutable, verifiable, and ready for instant customs clearance.</p>

          <p>
            <Link href="/book-demo/page">→ Stop customs delays. Explore Supply Chain packages (1, 10, or 50 docs)</Link>
          </p>
          <p>
            <Link href="/book-demo/page">→ Schedule a 15-minute logistics demo for your team</Link>
          </p>
        </article>
      </section>
    </main>
  );
}
