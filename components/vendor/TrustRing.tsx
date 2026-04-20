"use client";

export default function TrustRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="#1f2937" strokeWidth={7} />
        <circle
          cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-extrabold text-slate-100 leading-none">{score}</span>
        <span className="text-[9px] text-slate-500 font-semibold tracking-wider">TRUST</span>
      </div>
    </div>
  );
}
