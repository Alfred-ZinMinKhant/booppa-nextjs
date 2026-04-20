"use client";

const LEVELS = ["UNVERIFIED", "BASIC", "STANDARD", "DEEP", "CERTIFIED"] as const;
const COLORS = ["#475569", "#eab308", "#3b82f6", "#8b5cf6", "#10b981"];

export default function DepthLadder({ current }: { current: string }) {
  const idx = LEVELS.indexOf(current as typeof LEVELS[number]);

  return (
    <div className="flex gap-1 items-end">
      {LEVELS.map((l, i) => (
        <div key={l} className="flex flex-col items-center gap-1">
          <div
            className="w-[18px] rounded transition-all duration-300"
            style={{
              height: 8 + i * 5,
              background: i <= idx ? COLORS[i] : "#1f2937",
              border: i === idx ? `2px solid ${COLORS[i]}` : "2px solid transparent",
              boxShadow: i === idx ? `0 0 8px ${COLORS[i]}60` : "none",
            }}
          />
          {i === idx && (
            <span
              className="text-[7px] font-bold tracking-wider"
              style={{ color: COLORS[i] }}
            >
              {l.slice(0, 3)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
