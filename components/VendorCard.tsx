import Link from 'next/link'
import type { MarketplaceVendor } from '@/types'

interface VendorCardProps {
  vendor: MarketplaceVendor
}

export default function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Link
      href={`/vendors/${vendor.seo_slug}`}
      className="bg-white p-6 rounded-2xl border border-[#e2e8f0] hover:border-[#10b981] hover:translate-y-[-3px] hover:shadow-lg transition-all group block"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-[#0f172a] group-hover:text-[#10b981] transition-colors line-clamp-1">
          {vendor.company_name}
        </h3>
        {vendor.trust_score !== null && vendor.trust_score !== undefined && (
          <span className={`
            text-sm font-bold px-2 py-1 rounded-lg shrink-0 ml-2
            ${vendor.trust_score >= 80 ? 'bg-[#10b981]/10 text-[#10b981]' :
              vendor.trust_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-600'}
          `}>
            {vendor.trust_score}/100
          </span>
        )}
      </div>

      {vendor.industry && (
        <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-[#f1f5f9] text-[#64748b] mb-3">
          {vendor.industry}
        </span>
      )}

      {vendor.short_description && (
        <p className="text-sm text-[#64748b] line-clamp-2 mb-3">
          {vendor.short_description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
        <span>{vendor.country}</span>
        {vendor.claimed && (
          <span className="text-[#10b981] font-medium">✓ Claimed</span>
        )}
        {vendor.tier && (
          <span className="font-medium uppercase">{vendor.tier}</span>
        )}
      </div>
    </Link>
  )
}
