"use client";

export default function BlockchainProof() {
	return (
		<section className="py-24 px-6 bg-[#f8fafc]">
			<div className="max-w-[1200px] mx-auto">
				<div className="bg-[#0f172a] rounded-[2.5rem] p-8 lg:p-16 text-white overflow-hidden relative shadow-2xl">
					{/* Gradient Background Effect */}
					<div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
						<div className="absolute top-[-20%] right-[-10%] w-[60%] h-[140%] bg-gradient-to-br from-[#10b981] to-blue-600 rounded-full blur-[120px]" />
					</div>

					<div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<div>
							<div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-xs font-bold text-[#10b981] mb-8 bg-[#10b981]/10 uppercase tracking-widest">
								Trust Layer
							</div>
							<h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">
								Blockchain-anchored proof (example)
							</h2>
							<p className="text-xl text-white/70 mb-8 leading-relaxed">
								Every compliance report and document is notarized on the Polygon mainnet. This creates an immutable, timestamped record that procurement teams can verify independently.
							</p>

							<div className="space-y-4">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold">
										✓
									</div>
									<span className="text-white/90 font-medium">Court-admissible evidence</span>
								</div>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold">
										✓
									</div>
									<span className="text-white/90 font-medium">Immutable timestamping</span>
								</div>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold">
										✓
									</div>
									<span className="text-white/90 font-medium">Global verification standards</span>
								</div>
							</div>
						</div>

						<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-10">
							<div className="flex justify-between items-center mb-8">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center text-2xl">
										⛓️
									</div>
									<span className="font-black tracking-tighter text-xl">PROOFLOG</span>
								</div>
								<div className="px-3 py-1 bg-[#10b981] rounded-full text-[10px] font-black uppercase">
									Verified
								</div>
							</div>

							<div className="space-y-6">
								<div>
									<label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
										Document Hash (SHA-256)
									</label>
									<div className="bg-white/5 p-4 rounded-xl font-mono text-xs text-[#10b981] break-all border border-white/5">
										0x8f3a2c91c24e6b7d8f3a2c91c24e6b7d8f3a2c91c24e6b7d8f3a2c91c24e6b
									</div>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div>
										<label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
											Network
										</label>
										<div className="text-lg font-bold">Polygon Mainnet</div>
									</div>
									<div>
										<label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
											Status
										</label>
										<div className="text-lg font-bold text-[#10b981]">Confirmed</div>
									</div>
								</div>

								<div>
									<label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
										Timestamp (ISO)
									</label>
									<div className="text-sm font-mono text-white/70">
										2026-04-23T11:25:21+07:00
									</div>
								</div>

								<div className="pt-4">
									<button className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-bold transition-all flex items-center justify-center gap-2">
										View on Polygonscan ↗
									</button>
									<p className="text-[10px] text-white/30 text-center mt-4 uppercase font-bold tracking-widest">
										Interactive Proof Prototype
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
