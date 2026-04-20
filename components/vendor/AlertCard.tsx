"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import type { Alert, Product } from "./alertEngine";
import { PRODUCTS } from "./alertEngine";

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

export default function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const product = PRODUCTS[alert.productId];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl p-[18px_20px] flex gap-4 items-start transition-all duration-200 cursor-default"
      style={{
        background: hovered ? "rgba(255,255,255,0.03)" : "#0f172a",
        border: `1px solid ${hovered ? product.colorBorder : "#1e293b"}`,
      }}
    >
      {/* Dismiss */}
      <button
        onClick={() => onDismiss(alert.id)}
        className="absolute top-3 right-3 text-slate-600 hover:text-slate-400 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Product icon */}
      <div
        className="w-11 h-11 rounded-[10px] flex-shrink-0 flex items-center justify-center text-xl"
        style={{
          background: product.colorBg,
          border: `1px solid ${product.colorBorder}`,
        }}
      >
        {product.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <PriorityBadge priority={alert.priority} />
          <span className="text-[11px] font-semibold" style={{ color: product.color }}>
            {product.name}
          </span>
        </div>
        <p className="text-sm text-slate-200 font-semibold mb-1 leading-snug">
          {alert.headline}
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          {alert.detail}
        </p>
        <div className="flex items-center gap-2.5">
          <Link
            href={alert.ctaHref}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: product.color }}
          >
            {alert.cta}
          </Link>
          <span className="text-[10px] text-slate-600">
            {product.price} {product.priceNote}
          </span>
        </div>
      </div>
    </div>
  );
}
