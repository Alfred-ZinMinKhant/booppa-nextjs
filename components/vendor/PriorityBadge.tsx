"use client";

const PRIORITY_MAP: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  critical:    { label: "URGENT",      bg: "#7f1d1d", color: "#fca5a5", dot: "#ef4444" },
  high:        { label: "HIGH",        bg: "#78350f", color: "#fcd34d", dot: "#f59e0b" },
  opportunity: { label: "OPPORTUNITY", bg: "#064e3b", color: "#6ee7b7", dot: "#10b981" },
  medium:      { label: "RECOMMENDED", bg: "#1e1b4b", color: "#a5b4fc", dot: "#6366f1" },
  low:         { label: "OPTIONAL",    bg: "#1f2937", color: "#9ca3af", dot: "#6b7280" },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const c = PRIORITY_MAP[priority] || PRIORITY_MAP.low;

  return (
    <span
      className="inline-flex items-center gap-[5px] text-[10px] font-bold tracking-wider px-2 py-[3px] rounded"
      style={{ background: c.bg, color: c.color }}
    >
      <span
        className="w-[5px] h-[5px] rounded-full inline-block"
        style={{ background: c.dot }}
      />
      {c.label}
    </span>
  );
}
