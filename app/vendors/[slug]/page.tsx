import { config, endpoints } from '@/lib/config'
import Link from 'next/link'
import type { Metadata } from 'next'

interface VendorPageProps {
  params: { slug: string }
}

async function getVendor(slug: string) {
  try {
    const res = await fetch(
      `${config.apiUrl}/api/v1${endpoints.marketplace.vendor(slug)}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getIndustryData(slug: string) {
  try {
    const res = await fetch(
      `${config.apiUrl}/api/v1${endpoints.seo.industry(slug)}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const vendor = await getVendor(params.slug)
  if (vendor) {
    return {
      title: `${vendor.company_name} — Vendor Profile | Booppa`,
      description: vendor.short_description || `View trust score and compliance details for ${vendor.company_name}`,
    }
  }

  const industry = await getIndustryData(params.slug)
  if (industry) {
    return {
      title: `Top ${industry.industry} Vendors in Singapore | Booppa`,
      description: industry.description || `Discover verified ${industry.industry} vendors in Singapore`,
    }
  }

  return { title: 'Vendor | Booppa' }
}

export default async function VendorSlugPage({ params }: VendorPageProps) {
  const vendor = await getVendor(params.slug)

  if (vendor) {
    return <VendorProfile vendor={vendor} />
  }

  const industry = await getIndustryData(params.slug)

  if (industry) {
    return <IndustryPage industry={industry} />
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Not Found</h1>
        <p className="text-[#64748b] mb-6">This vendor or industry page doesn&apos;t exist.</p>
        <Link href="/vendors" className="text-[#10b981] font-bold hover:underline">
          ← Back to directory
        </Link>
      </div>
    </main>
  )
}

function VendorProfile({ vendor }: { vendor: any }) {
  const scoreColor = vendor.trust_score >= 80 ? 'text-[#10b981]' :
    vendor.trust_score >= 50 ? 'text-yellow-600' : 'text-red-500'

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto">
          <Link href="/vendors" className="text-[#94a3b8] hover:text-white mb-4 inline-block transition-colors">
            ← Back to directory
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold mb-2">{vendor.company_name}</h1>
              <div className="flex items-center gap-4 text-[#94a3b8]">
                {vendor.industry && <span>{vendor.industry}</span>}
                <span>{vendor.country}</span>
                {vendor.claimed && <span className="text-[#10b981]">✓ Verified</span>}
              </div>
            </div>
            {vendor.trust_score !== null && vendor.trust_score !== undefined && (
              <div className="text-center">
                <div className={`text-5xl font-bold ${scoreColor}`}>{vendor.trust_score}</div>
                <div className="text-sm text-[#94a3b8]">Trust Score</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-12 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {vendor.short_description && (
              <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0]">
                <h2 className="text-xl font-bold text-[#0f172a] mb-4">About</h2>
                <p className="text-[#64748b] leading-relaxed">{vendor.short_description}</p>
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0]">
              <h2 className="text-xl font-bold text-[#0f172a] mb-4">Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                {vendor.uen && (
                  <>
                    <dt className="text-sm text-[#64748b]">UEN</dt>
                    <dd className="text-sm font-medium text-[#0f172a]">{vendor.uen}</dd>
                  </>
                )}
                {vendor.entity_type && (
                  <>
                    <dt className="text-sm text-[#64748b]">Entity Type</dt>
                    <dd className="text-sm font-medium text-[#0f172a]">{vendor.entity_type}</dd>
                  </>
                )}
                {vendor.domain && (
                  <>
                    <dt className="text-sm text-[#64748b]">Domain</dt>
                    <dd className="text-sm font-medium text-[#0f172a]">{vendor.domain}</dd>
                  </>
                )}
                {vendor.tier && (
                  <>
                    <dt className="text-sm text-[#64748b]">Tier</dt>
                    <dd className="text-sm font-medium text-[#0f172a] uppercase">{vendor.tier}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0]">
              <h3 className="font-bold text-[#0f172a] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/vendor-proof?company=${encodeURIComponent(vendor.company_name)}&website=${encodeURIComponent(vendor.website || '')}`}
                  className="block w-full text-center py-3 px-4 bg-[#10b981] text-white font-bold rounded-xl hover:bg-[#059669] transition-colors"
                >
                  Run Vendor Proof
                </Link>
                {vendor.website && (
                  <a
                    href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 px-4 border border-[#e2e8f0] text-[#64748b] font-medium rounded-xl hover:border-[#10b981] hover:text-[#10b981] transition-colors"
                  >
                    Visit Website ↗
                  </a>
                )}
              </div>
            </div>

            {!vendor.claimed && (
              <div className="bg-[#10b981]/5 p-6 rounded-2xl border border-[#10b981]/20">
                <h3 className="font-bold text-[#0f172a] mb-2">Is this your company?</h3>
                <p className="text-sm text-[#64748b] mb-4">
                  Claim this profile to manage your trust score and respond to vendor proofs.
                </p>
                <Link
                  href="/trial"
                  className="text-[#10b981] font-bold text-sm hover:underline"
                >
                  Claim Profile →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function IndustryPage({ industry }: { industry: any }) {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-20 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <Link href="/vendors" className="text-[#94a3b8] hover:text-white mb-4 inline-block transition-colors">
            ← Back to directory
          </Link>
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">{industry.industry} Vendors</h1>
          <p className="text-xl text-[#94a3b8] max-w-[600px] mx-auto">
            {industry.description || `${industry.vendor_count} verified ${industry.industry} vendors in Singapore`}
          </p>
          {industry.avg_trust_score && (
            <div className="mt-6 inline-block px-4 py-2 bg-white/10 rounded-full">
              Average Trust Score: <span className="font-bold text-[#10b981]">{Math.round(industry.avg_trust_score)}/100</span>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(industry.vendors || []).map((vendor: any) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.seo_slug}`}
                className="bg-white p-6 rounded-2xl border border-[#e2e8f0] hover:border-[#10b981] hover:translate-y-[-3px] hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#0f172a] group-hover:text-[#10b981] transition-colors line-clamp-1">
                    {vendor.company_name}
                  </h3>
                  {vendor.trust_score !== null && vendor.trust_score !== undefined && (
                    <span className={`
                      text-sm font-bold px-2 py-1 rounded-lg
                      ${vendor.trust_score >= 80 ? 'bg-[#10b981]/10 text-[#10b981]' :
                        vendor.trust_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'}
                    `}>
                      {vendor.trust_score}/100
                    </span>
                  )}
                </div>
                {vendor.short_description && (
                  <p className="text-sm text-[#64748b] line-clamp-2">{vendor.short_description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
