"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CMS_BASE =
	process.env.NEXT_PUBLIC_CMS_BASE ||
	process.env.NEXT_PUBLIC_API_Backend ||
	"https://cms.booppa.io";

const CONTENT_TYPES = [
	{ key: "blogs", label: "Blog Posts", api: "/api/public/blogs/" },
	{ key: "rfp-tips", label: "RFP Tips", api: "/api/public/rfp-tips/" },
	{
		key: "compliance",
		label: "Compliance Education",
		api: "/api/public/compliance/",
	},
	{
		key: "vendor-guides",
		label: "Vendor Guides",
		api: "/api/public/vendor-guides/",
	},
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]["key"];

interface Post {
	id: string;
	title: string;
	slug: string;
	author: string | null;
	published: boolean;
	published_at: string | null;
	created_at: string;
}

export default function AdminContentPage() {
	const router = useRouter();
	const [activeType, setActiveType] = useState<ContentType>("blogs");
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const currentType = CONTENT_TYPES.find((t) => t.key === activeType)!;

	useEffect(() => {
		setLoading(true);
		setError("");
		fetch(`${CMS_BASE}${currentType.api}`, { credentials: "include" })
			.then((r) => {
				if (r.status === 401) {
					router.replace("/admin/login");
					return null;
				}
				return r.ok ? r.json() : null;
			})
			.then((data) => {
				if (data) setPosts(data.results || []);
				setLoading(false);
			})
			.catch(() => {
				setError("Failed to load content.");
				setLoading(false);
			});
	}, [activeType]);

	const handleLogout = async () => {
		await fetch("/api/admin/logout", { method: "POST" });
		router.replace("/admin/login");
	};

	return (
		<main className="min-h-screen bg-[#f8fafc]">
			{/* Header */}
			<section className="py-4 px-6 bg-white border-b border-[#e2e8f0]">
				<div className="max-w-[1200px] mx-auto flex items-center justify-between">
					<h1 className="text-2xl font-bold text-[#0f172a]">
						Content Management
					</h1>
					<div className="flex items-center gap-3">
						<Link
							href="/admin/dashboard"
							className="px-4 py-2 border border-[#e2e8f0] text-[#64748b] font-medium rounded-lg hover:border-[#10b981] transition-colors text-sm"
						>
							← Dashboard
						</Link>
						<a
							href={`${CMS_BASE}/django-admin/`}
							target="_blank"
							rel="noopener noreferrer"
							className="px-4 py-2 bg-[#10b981] text-white font-medium rounded-lg hover:bg-[#059669] transition-colors text-sm"
						>
							Open CMS Editor ↗
						</a>
						<button
							onClick={handleLogout}
							className="text-sm text-[#64748b] hover:text-red-500 transition-colors"
						>
							Logout
						</button>
					</div>
				</div>
			</section>

			<section className="py-8 px-6">
				<div className="max-w-[1200px] mx-auto">
					{/* Type tabs */}
					<div className="flex gap-2 mb-6 flex-wrap">
						{CONTENT_TYPES.map((t) => (
							<button
								key={t.key}
								onClick={() => setActiveType(t.key)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									activeType === t.key
										? "bg-[#10b981] text-white"
										: "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#10b981]"
								}`}
							>
								{t.label}
							</button>
						))}
					</div>

					{/* Action bar */}
					<div className="flex items-center justify-between mb-4">
						<p className="text-sm text-[#64748b]">
							Showing published <strong>{currentType.label}</strong>. To create
							or edit, use the CMS Editor.
						</p>
						<a
							href={`${CMS_BASE}/django-admin/cms/${activeType === "blogs" ? "blogpost" : activeType === "rfp-tips" ? "rfptip" : activeType === "compliance" ? "compliancepost" : "vendorguide"}/add/`}
							target="_blank"
							rel="noopener noreferrer"
							className="px-4 py-2 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors"
						>
							+ New {currentType.label.replace(/s$/, "")}
						</a>
					</div>

					{/* Content */}
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">
							{error}
						</div>
					)}

					<div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
						{loading ? (
							<div className="divide-y divide-[#f1f5f9]">
								{[...Array(5)].map((_, i) => (
									<div
										key={i}
										className="h-16 px-6 py-4 animate-pulse bg-[#f8fafc]"
									/>
								))}
							</div>
						) : posts.length === 0 ? (
							<div className="py-16 text-center text-sm text-[#64748b]">
								No published {currentType.label.toLowerCase()} yet.{" "}
								<a
									href={`${CMS_BASE}/django-admin/`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[#10b981] underline"
								>
									Create one in the CMS →
								</a>
							</div>
						) : (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
										<th className="text-left px-6 py-3 text-xs text-[#64748b] font-medium">
											Title
										</th>
										<th className="text-left px-6 py-3 text-xs text-[#64748b] font-medium hidden sm:table-cell">
											Slug
										</th>
										<th className="text-left px-6 py-3 text-xs text-[#64748b] font-medium hidden md:table-cell">
											Author
										</th>
										<th className="text-left px-6 py-3 text-xs text-[#64748b] font-medium">
											Published
										</th>
										<th className="text-right px-6 py-3 text-xs text-[#64748b] font-medium">
											Edit
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#f1f5f9]">
									{posts.map((post) => (
										<tr
											key={post.id}
											className="hover:bg-[#f8fafc] transition-colors"
										>
											<td className="px-6 py-4 font-medium text-[#0f172a] max-w-xs truncate">
												{post.title}
											</td>
											<td className="px-6 py-4 text-[#64748b] hidden sm:table-cell font-mono text-xs">
												{post.slug}
											</td>
											<td className="px-6 py-4 text-[#64748b] hidden md:table-cell">
												{post.author || "—"}
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
													{post.published_at
														? new Date(post.published_at).toLocaleDateString(
																"en-SG",
																{
																	day: "numeric",
																	month: "short",
																	year: "numeric",
																},
															)
														: "Published"}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												<a
													href={`${CMS_BASE}/django-admin/cms/${activeType === "blogs" ? "blogpost" : activeType === "rfp-tips" ? "rfptip" : activeType === "compliance" ? "compliancepost" : "vendorguide"}/${post.id}/change/`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-[#10b981] hover:underline text-xs font-medium"
												>
													Edit ↗
												</a>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</section>
		</main>
	);
}
