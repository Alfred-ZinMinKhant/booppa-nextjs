import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const apiBase = process.env.NEXT_PUBLIC_API_Backend || process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_CMS_BASE || 'http://localhost:8001';
  const res = await fetch(`${apiBase}/api/public/blogs/${params.slug}/`, { cache: 'no-store' });
  if (!res.ok) return notFound();
  const post = await res.json();

  return (
    <main className="min-h-screen bg-black text-white py-12">
      <section className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex flex-col gap-4 mb-8">
          {post.images && post.images.length > 0 && (
            <Image src={post.images[0]} alt={post.title} width={800} height={400} className="rounded-lg object-cover" />
          )}
          <div className="text-gray-400 text-sm">
            By {post.author || 'Unknown'} | Published {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-8 flex flex-wrap gap-4">
          {post.cta1_text && post.cta1_url && (
            <a
              href={post.cta1_url}
              target="_blank"
              rel="noreferrer"
              aria-label={post.cta1_text}
              className="inline-flex items-center gap-3 text-white bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 px-5 py-3 rounded-full font-semibold"
            >
              <span>{post.cta1_text}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
          {post.cta2_text && post.cta2_url && (
            <a
              href={post.cta2_url}
              target="_blank"
              rel="noreferrer"
              aria-label={post.cta2_text}
              className="inline-flex items-center gap-3 text-white border border-gray-700 bg-transparent hover:bg-gray-800 transition px-5 py-3 rounded-full font-medium"
            >
              <span>{post.cta2_text}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
