"use client";

import { useEffect, useState } from "react";
import truncate from 'html-truncate';
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
    <main className="bg-white min-h-screen text-[#0f172a] py-24">
      <section className="max-w-[1000px] mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-black mb-6">Compliance Insights</h1>
          <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
            Practical guidance on PDPA, MAS regulations, and compliance evidence management in Singapore.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#64748b]">Loading insights...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {posts.map((p: any) => {
              const href = `/blog/${p.slug}`;
              const image = (p.images && p.images.length > 0 && p.images[0]) || '/default-blog.jpg';
              let excerpt = '';
              if (p.content) {
                excerpt = truncate(p.content, 140, { ellipsis: '...' });
              }
              return (
                <article key={p.id} className="bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] hover:shadow-2xl transition-all group flex flex-col">
                  <Link href={href} className="block grow">
                    <div className="h-56 w-full relative overflow-hidden bg-gray-50">
                      <Image 
                        src={image} 
                        alt={p.title} 
                        fill 
                        className="object-contain transition-transform duration-500" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#0f172a] rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                          Case Study
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h2 className="text-2xl font-bold mb-4 group-hover:text-[#10b981] transition-colors line-clamp-2 leading-tight">
                        {p.title}
                      </h2>
                      <div 
                        className="text-[#64748b] text-sm leading-relaxed mb-6 line-clamp-3" 
                        dangerouslySetInnerHTML={{ __html: excerpt }} 
                      />
                      
                      <div className="flex items-center justify-between pt-6 border-t border-[#f1f5f9]">
                        <span className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
                          {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[#10b981] font-black text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                          Read More <span>→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        <div className="bg-[#0f172a] p-12 lg:p-20 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981] opacity-10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-black mb-4 text-white">Stay Updated on Singapore Compliance</h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Get monthly insights on PDPA, MAS regulations, and compliance best practices.
            </p>
            <div className="max-w-[500px] mx-auto flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="your@company.sg"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#10b981] transition-all"
              />
              <button className="btn btn-primary px-8 py-4 font-black whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
