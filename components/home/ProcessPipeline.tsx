"use client";

export default function ProcessPipeline() {
	const steps = [
		{
			title: "Upload",
			desc: "Vendor data submitted",
			icon: "📤",
			detail: "Secure data ingest",
		},
		{
			title: "Scan",
			desc: "Automated compliance analysis",
			icon: "🔍",
			detail: "PDPA & ISO check",
		},
		{
			title: "Score",
			desc: "Risk and compliance scoring",
			icon: "📊",
			detail: "Automated metrics",
		},
		{
			title: "Proof",
			desc: "Blockchain anchoring",
			icon: "🔗",
			detail: "Polygon mainnet",
		},
		{
			title: "Report",
			desc: "Downloadable audit-ready output",
			icon: "📄",
			detail: "Instant PDF/DOCX",
		},
	];

	return (
		<section className="py-24 px-6 bg-white overflow-hidden">
			<div className="max-w-[1200px] mx-auto">
				<div className="text-center mb-20">
					<h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] mb-4">
						The Pipeline
					</h2>
					<p className="text-xl text-[#64748b] max-w-2xl mx-auto">
						From raw data to verified trust in minutes. No manual intervention,
						no consultants, no waiting.
					</p>
				</div>

				<div className="relative">
					{/* Connecting Line (Desktop) */}
					<div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-[#f1f5f9] -translate-y-1/2 z-0">
						<div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#10b981] to-[#10b981]/10 w-1/2 animate-pulse" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
						{steps.map((step, index) => (
							<div
								key={index}
								className="flex flex-col items-center text-center group"
							>
								<div className="w-20 h-20 bg-white border-2 border-[#f1f5f9] group-hover:border-[#10b981] rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg relative">
									{step.icon}
									<div className="absolute -top-3 -right-3 w-8 h-8 bg-[#0f172a] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
										{index + 1}
									</div>
								</div>
								<h3 className="text-xl font-black text-[#0f172a] mb-2">
									{step.title}
								</h3>
								<p className="text-sm font-bold text-[#10b981] mb-1 uppercase tracking-widest text-[10px]">
									{step.detail}
								</p>
								<p className="text-sm text-[#64748b]">{step.desc}</p>

								{/* Mobile Arrow */}
								{index < steps.length - 1 && (
									<div className="lg:hidden mt-8 text-2xl text-[#cbd5e1]">
										↓
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
