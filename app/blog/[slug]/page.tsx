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
      </section>
    </main>
  );
}
