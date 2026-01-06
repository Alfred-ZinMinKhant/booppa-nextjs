import Image from 'next/image';
import Link from 'next/link';

export default function InfrastructureAwsPolygon() {
  return (
    <main className="min-h-screen bg-black text-white py-12">
      <section className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6">Why We Built on AWS Singapore and Polygon for Regulatory Compliance</h1>
        <p className="text-gray-300 mb-6"><strong>SEO Focus:</strong> AWS Singapore data residency, Polygon blockchain compliance, secure data notarization.</p>

        <div className="mb-8">
          <div className="w-full h-72 relative rounded overflow-hidden">
            <Image src="/3-infrastructure-aws-polygon.jpg" alt="AWS Singapore and Polygon" fill className="object-cover" />
          </div>
        </div>

        <article className="prose prose-invert max-w-none text-gray-200">
          <p>When building a compliance infrastructure, where you store data and how you notarize it are the two most critical decisions. At Booppa, we chose a dual-layer architecture—<strong>AWS Singapore and Polygon</strong>—to meet the strictest regulatory standards in Asia.</p>

          <h3>Data Residency: The AWS Singapore Advantage</h3>
          <p>For MAS-regulated entities and PDPA-compliant firms, data residency is non-negotiable. Booppa is hosted exclusively on <strong>AWS Singapore (ap-southeast-1)</strong>. This ensures:</p>
          <ul>
            <li><strong>Full compliance:</strong> Alignment with Singapore’s data sovereignty laws.</li>
            <li><strong>Ultra-low latency:</strong> Faster processing for local businesses.</li>
            <li><strong>Enterprise Security:</strong> Leveraging AWS Shield and GuardDuty for top-tier protection.</li>
          </ul>

          <h3>Scalability & Integrity: Why Polygon?</h3>
          <p>We chose Polygon as our blockchain layer because it offers the perfect balance of security and cost-efficiency.</p>
          <ol>
            <li><strong>Immutability:</strong> Once a document hash is on Polygon, it cannot be altered or deleted.</li>
            <li><strong>Public Verifiability:</strong> Regulators can verify hashes independently of Booppa, ensuring true transparency.</li>
            <li><strong>Sustainability:</strong> Polygon’s proof-of-stake consensus is eco-friendly, aligning with corporate ESG goals.</li>
          </ol>

          <p>By keeping sensitive data <strong>off-chain</strong> on AWS and only the cryptographic proof <strong>on-chain</strong> on Polygon, Booppa provides the ultimate privacy-first compliance tool.</p>

          <hr />

          <h3>Technical Deep Dive</h3>
          <p>Infrastructure choices define compliance outcomes. Booppa is built exactly where regulators expect it to be.</p>

          <p>
            <Link href="/book-demo/page">→ Test the platform now. Secure your first document for SGD 69</Link>
          </p>
          <p>
            <Link href="/book-demo/page">→ Schedule a 15-minute technical deep dive with our CTO</Link>
          </p>
        </article>
      </section>
    </main>
  );
}
