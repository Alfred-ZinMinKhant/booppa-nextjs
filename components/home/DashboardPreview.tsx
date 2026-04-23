"use client";

export default function DashboardPreview() {
	return (
		<section className="py-24 px-6 bg-[#f8fafc]">
			<div className="max-w-[1200px] mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] mb-4">
						Internal Logic, Visible Output
					</h2>
					<p className="text-xl text-[#64748b] max-w-2xl mx-auto">
						Keep your sensitive data private while projecting confidence. Our dashboard bridges backend automation with procurement-ready visibility.
					</p>
				</div>

				<div className="bg-white rounded-[2.5rem] border border-[#e2e8f0] shadow-2xl overflow-hidden max-w-5xl mx-auto">
					{/* Mock Browser/App Header */}
					<div className="bg-[#f1f5f9] px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
						<div className="flex gap-2">
							<div className="w-3 h-3 rounded-full bg-[#ef4444]" />
							<div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
							<div className="w-3 h-3 rounded-full bg-[#10b981]" />
						</div>
						<div className="bg-white px-4 py-1.5 rounded-lg border border-[#e2e8f0] text-[10px] font-medium text-[#94a3b8] w-64 text-center">
							app.booppa.com/dashboard
						</div>
						<div className="w-12" />
					</div>

					<div className="flex min-h-[500px]">
						{/* Sidebar Mock */}
						<div className="w-64 bg-[#0f172a] p-6 hidden lg:block">
							<div className="flex items-center gap-3 mb-10">
								<div className="w-8 h-8 bg-[#10b981] rounded-lg" />
								<span className="font-black text-white text-lg tracking-tighter">BOOPPA</span>
							</div>
							<nav className="space-y-4">
								<div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Main Menu</div>
								<div className="bg-[#10b981]/10 text-[#10b981] px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3">
									<span>🏠</span> Dashboard
								</div>
								<div className="text-white/60 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors">
									<span>📊</span> My Reports
								</div>
								<div className="text-white/60 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors">
									<span>🔗</span> Evidence History
								</div>
								<div className="text-white/60 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors">
									<span>⚙️</span> Settings
								</div>
							</nav>
						</div>

						{/* Main Content Mock */}
						<div className="flex-1 p-8 lg:p-12">
							<div className="flex justify-between items-center mb-10">
								<h3 className="text-2xl font-black text-[#0f172a]">Workspace Overview</h3>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-full bg-[#f1f5f9] border border-[#e2e8f0]" />
									<div className="hidden sm:block">
										<p className="text-sm font-bold text-[#0f172a]">Acme Solutions</p>
										<p className="text-[10px] text-[#94a3b8]">Vendor Account</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
								<div className="p-6 rounded-2xl border-2 border-[#10b981] bg-[#10b981]/5">
									<p className="text-[10px] font-black text-[#059669] uppercase mb-1">Compliance Status</p>
									<h4 className="text-3xl font-black text-[#0f172a]">Verified</h4>
									<p className="text-xs text-[#64748b] mt-2">Next refresh in 14 days</p>
								</div>
								<div className="p-6 rounded-2xl border-2 border-[#e2e8f0] bg-white">
									<p className="text-[10px] font-black text-[#94a3b8] uppercase mb-1">Active Evidence</p>
									<h4 className="text-3xl font-black text-[#0f172a]">12 Files</h4>
									<p className="text-xs text-[#64748b] mt-2">Last notarized 2 hours ago</p>
								</div>
							</div>

							<div className="mb-10">
								<h5 className="font-black text-[#0f172a] mb-4 uppercase text-[10px] tracking-widest">My Recent Reports</h5>
								<div className="space-y-3">
									{[
										{ title: "PDPA Compliance Scan", date: "Today", score: "87/100", status: "Verified" },
										{ title: "IMDA Security Audit", date: "Yesterday", score: "92/100", status: "Verified" },
										{ title: "Procurement Evidence Kit", date: "22 Apr", score: "N/A", status: "Ready" },
									].map((report, i) => (
										<div key={i} className="flex items-center justify-between p-4 rounded-xl border border-[#e2e8f0] hover:shadow-md transition-all">
											<div className="flex items-center gap-4">
												<div className="w-10 h-10 bg-[#f8fafc] rounded-lg flex items-center justify-center text-lg">📄</div>
												<div>
													<p className="text-sm font-bold text-[#0f172a]">{report.title}</p>
													<p className="text-[10px] text-[#94a3b8]">{report.date}</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-sm font-black text-[#10b981]">{report.score}</p>
												<p className="text-[10px] font-bold text-[#94a3b8] uppercase">{report.status}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
