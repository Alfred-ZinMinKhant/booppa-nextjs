import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const apiBase = process.env.NEXT_PUBLIC_API_Backend || process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_CMS_BASE || 'http://localhost:8001';
  const res = await fetch(`${apiBase}/api/public/blogs/${params.slug}/`, { cache: 'no-store' });
  if (!res.ok) return notFound();
  const post = await res.json();

  return (
    <main className="bg-white min-h-screen text-[#0f172a] py-24 px-6">
      <section className="max-w-[800px] mx-auto">
        <h1 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">{post.title}</h1>
        
        <div className="mb-12">
          {post.images && post.images.length > 0 && (
            <div className="bg-gray-50 rounded-[2.5rem] p-4 border border-[#e2e8f0] mb-6 overflow-hidden">
              <Image 
                src={post.images[0]} 
                alt={post.title} 
                width={1200} 
                height={600} 
                className="rounded-2xl w-full h-auto object-contain shadow-sm" 
              />
            </div>
          )}
          <div className="flex items-center gap-3 text-[#64748b] text-sm font-bold uppercase tracking-wider">
            <span className="w-8 h-[2px] bg-[#10b981]"></span>
            By {post.author || 'BOOPPA Compliance Team'} | {post.published_at ? new Date(post.published_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'February 2024'}
          </div>
        </div>

        <article 
          className="prose prose-slate max-w-none text-lg leading-relaxed text-[#475569] prose-headings:text-[#0f172a] prose-headings:font-black prose-a:text-[#10b981] prose-strong:text-[#0f172a]" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        <div className="mt-16 pt-12 border-t border-[#f1f5f9] flex flex-wrap gap-4">
          {post.cta1_text && post.cta1_url && (
            <a
              href={post.cta1_url}
              className="btn btn-primary px-8 py-4 font-black"
            >
              {post.cta1_text}
            </a>
          )}
          {post.cta2_text && post.cta2_url && (
            <a
              href={post.cta2_url}
              className="btn btn-outline border-[#0f172a] text-[#0f172a] px-8 py-4 font-bold"
            >
              {post.cta2_text}
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
