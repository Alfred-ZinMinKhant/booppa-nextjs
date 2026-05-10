import type { Metadata } from 'next'
import WatchlistPanel from '@/components/orgs/WatchlistPanel'

export const metadata: Metadata = {
  title: 'Vendor Watchlist — Booppa',
  robots: { index: false, follow: false },
}

export default function OrgWatchlistPage({ params }: { params: { orgId: string } }) {
  return <WatchlistPanel orgId={params.orgId} />
}
