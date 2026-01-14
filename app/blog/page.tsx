"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const apiBase = process.env.NEXT_PUBLIC_API_Backend || process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_CMS_BASE || 'http://localhost:8001';
      try {
        const res = await fetch(`${apiBase}/api/public/blogs/`);
        if (!res.ok) return setPosts([]);
        const data = await res.json();
        if (mounted) setPosts(data.results || []);
      } catch (e) {
        console.error('Error fetching posts', e);
        if (mounted) setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white py-12">
      <section className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>

        {loading ? (
          <div className="text-gray-400">Loading posts…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((p: any) => {
              const href = `/blog/${p.slug}`;
              const image = (p.images && p.images.length > 0 && p.images[0]) || '/default-blog.jpg';
              const excerpt = p.content ? p.content.substring(0, 160) + '...' : '';
              return (
                <article key={p.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                  <Link href={href} className="block">
                    <div className="h-44 w-full relative">
                      <Image src={image} alt={p.title} fill className="object-cover" />
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold">{p.title}</h2>
                      <p className="mt-3 text-gray-300">{excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-booppa-blue bg-white/5 hover:bg-white/10 transition-colors duration-150 px-3 py-1 rounded-md font-medium w-max">
                        Read more
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
