import Link from 'next/link';
import Image from 'next/image';

const posts = [
    {
    title: 'Singapore Courts and Blockchain Evidence: 2025 Updates on Admissibility and Provenance',
    href: '/blog/singapore-courts-blockchain-evidence-2025',
    image: '/1-Authority.jpg',
    excerpt: 'How recent High Court rulings shape the admissibility of blockchain evidence in Singapore (2025).',
  },
  {
    title: 'How SMEs Can Reduce Compliance Costs by 90% with Blockchain',
    href: '/blog/how-smes-can-reduce-compliance-costs-by-90-with-blockchain',
    image: '/2-Conversion-Layer.jpg',
    excerpt: 'A practical guide for SMEs on using on-chain notarization and PDPC guidance to cut compliance costs.',
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-black text-white py-12">
      <section className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((p) => (
            <article key={p.href} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
              <Link href={p.href} className="block">
                <div className="h-44 w-full relative">
                  <Image src={p.image} alt={p.title} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold">{p.title}</h2>
                  <p className="mt-3 text-gray-300">{p.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-booppa-blue bg-white/5 hover:bg-white/10 transition-colors duration-150 px-3 py-1 rounded-md font-medium w-max">
                    Read more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
