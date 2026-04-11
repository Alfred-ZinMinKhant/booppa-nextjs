import Link from 'next/link';
import { config } from '@/lib/config';

export const metadata = {
  title: 'Resources — Guides, Blog & Compliance Tips | BOOPPA',
  description: 'Guides, blog posts, RFP tips, and PDPA compliance education for Singapore vendors and procurement teams.',
};

const FALLBACK_POSTS = [
  { slug: 'singapore-courts-blockchain-evidence-2025', tag: 'Compliance', title: 'How Singapore Courts Are Accepting Blockchain Evidence in 2025', date: 'Jan 2025' },
  { slug: 'how-smes-can-reduce-compliance-costs-by-90-with-blockchain', tag: 'SME', title: 'How SMEs Can Reduce Compliance Costs by 90% with Blockchain', date: 'Dec 2024' },
  { slug: 'infrastructure-aws-polygon', tag: 'Infrastructure', title: 'Why We Built on AWS Singapore and Polygon', date: 'Nov 2024' },
];

async function getRecentPosts() {
  try {
    const res = await fetch(`${config.apiUrl}/api/public/blogs/?limit=3`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.results || []) as any[];
  } catch {
    return null;
  }
}

const FALLBACK_GUIDES = [
  {
    category: 'RFP Tips',
    items: [
      { title: 'How to Win Government Tenders in Singapore', desc: 'A practical guide to GeBIZ submission requirements, common disqualification reasons, and how to prepare procurement-ready evidence.', href: '/blog' },
      { title: 'PDPA Compliance Checklist for SMEs', desc: 'The 8 PDPA obligations every Singapore SME must address before submitting to enterprise procurement portals.', href: '/pdpa' },
      { title: 'RFP Compliance Section: What Procurement Teams Actually Check', desc: 'Inside view of what procurement evaluators look for in vendor compliance sections — and how to pass every time.', href: '/blog' },
    ],
  },
  {
    category: 'Compliance Education',
    items: [
      { title: 'PDPA in Plain English', desc: 'The Personal Data Protection Act explained without the legal jargon. What it means for your business and what you need to document.', href: '/pdpa' },
      { title: 'Blockchain Notarization vs Legal Notarization', desc: 'What blockchain timestamping can and cannot do — and when each type of notarization is appropriate for your documents.', href: '/notarization' },
      { title: 'Singapore MAS TRM Guidelines: Key Requirements', desc: 'Technology Risk Management requirements for financial institutions — what evidence you need and how BOOPPA helps you build it.', href: '/compliance' },
    ],
  },
  {
    category: 'Vendor Guides',
    items: [
      { title: 'How to Claim Your BOOPPA Vendor Profile', desc: 'Step-by-step guide to claiming, completing, and getting verified on the BOOPPA Vendor Network.', href: '/auth/register' },
      { title: 'Building a Procurement-Ready Evidence Package', desc: 'What documents to include in your RFP evidence package and how to structure them for maximum credibility.', href: '/rfp-acceleration' },
      { title: 'Understanding Your Tender Win Probability Score', desc: 'How the BOOPPA CAL engine scores your tender eligibility and what actions improve your probability.', href: '/tender-check' },
    ],
  },
];

async function getGuides() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io'}/api/v1/resources/`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()
    // Convert { categories: { "RFP Tips": [{title, description, href}] } } to guides array format
    return Object.entries(data.categories || {}).map(([category, items]) => ({
      category,
      items: (items as any[]).map(item => ({ title: item.title, desc: item.description || '', href: item.href })),
    }))
  } catch {
    return null
  }
}

const tools = [
  { title: 'Tender Win Probability', desc: 'Enter a GeBIZ tender number and get an instant eligibility score.', href: '/tender-check', cta: 'Check Tender →' },
  { title: 'Document Verify', desc: 'Verify any blockchain-anchored BOOPPA document instantly.', href: '/verify', cta: 'Verify Document →' },
  { title: 'PDPA Quick Scan', desc: 'Run a 5-minute PDPA compliance check on your website.', href: '/pdpa', cta: 'Start Scan →' },
  { title: 'Vendor Comparison', desc: 'Compare vendors side-by-side on compliance and evidence depth.', href: '/compare', cta: 'Compare Now →' },
];

export default async function ResourcesPage() {
  const livePosts = await getRecentPosts();
  const guides = (await getGuides()) || FALLBACK_GUIDES;

  return (
    <main className="overflow-x-hidden">

      {/* Hero */}
      <section className="py-20 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-black mb-4">Resources</h1>
          <p className="text-xl text-white/70">
            Guides, RFP tips, compliance education, and free tools — everything you need to win more contracts and stay compliant.
          </p>
        </div>
      </section>

      {/* Blog */}
      <section className="py-20 px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a]">Latest from the Blog</h2>
            <Link href="/blog" className="text-[#10b981] font-bold text-sm hover:underline">View all posts →</Link>
          </div>

          {livePosts && livePosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {livePosts.map((post: any) => (
                <Link
                  key={post.id || post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-[#f8fafc] rounded-2xl p-6 border border-[#e2e8f0] hover:border-[#10b981] hover:shadow-md transition-all"
                >
                  <span className="inline-block text-xs font-bold text-[#10b981] uppercase tracking-wider mb-3">
                    {post.category || 'Insights'}
                  </span>
                  <h3 className="text-base font-bold text-[#0f172a] mb-2 group-hover:text-[#10b981] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.created_at && (
                    <span className="text-xs text-[#94a3b8]">
                      {new Date(post.created_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FALLBACK_POSTS.map((post, i) => (
                <Link key={i} href={`/blog/${post.slug}`} className="group block bg-[#f8fafc] rounded-2xl p-6 border border-[#e2e8f0] hover:border-[#10b981] hover:shadow-md transition-all">
                  <span className="inline-block text-xs font-bold text-[#10b981] uppercase tracking-wider mb-3">{post.tag}</span>
                  <h3 className="text-base font-bold text-[#0f172a] mb-2 group-hover:text-[#10b981] transition-colors">{post.title}</h3>
                  <span className="text-xs text-[#94a3b8]">{post.date}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guides */}
      {guides.map((section, si) => (
        <section key={si} className={`py-20 px-6 ${si % 2 === 0 ? 'bg-[#f8fafc]' : 'bg-white'} border-b border-[#e2e8f0]`}>
          <div className="max-w-[1100px] mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] mb-10">{section.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {section.items.map((item, i) => (
                <Link key={i} href={item.href} className="group block bg-white rounded-2xl p-6 border border-[#e2e8f0] hover:border-[#10b981] hover:shadow-md transition-all">
                  <h3 className="text-base font-bold text-[#0f172a] mb-2 group-hover:text-[#10b981] transition-colors">{item.title}</h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Free Tools */}
      <section className="py-20 px-6 bg-[#0f172a]">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-10">Free Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#10b981] transition-all">
                <h3 className="text-base font-bold text-white mb-2">{t.title}</h3>
                <p className="text-sm text-white/60 mb-6">{t.desc}</p>
                <Link href={t.href} className="text-[#10b981] font-bold text-sm hover:underline">{t.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] mb-4">Have questions?</h2>
          <p className="text-[#64748b] mb-8">Visit our FAQ or reach out to the team directly.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/faq" className="px-6 py-3 bg-[#10b981] text-white font-bold rounded-xl hover:bg-[#059669] transition-colors">Read FAQ</Link>
            <Link href="/support" className="px-6 py-3 border border-[#e2e8f0] text-[#0f172a] font-bold rounded-xl hover:border-[#10b981] transition-colors">Contact Support</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
