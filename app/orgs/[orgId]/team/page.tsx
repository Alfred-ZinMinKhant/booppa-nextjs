import type { Metadata } from 'next'
import TeamPanel from '@/components/orgs/TeamPanel'

export const metadata: Metadata = {
  title: 'Team — Booppa',
  robots: { index: false, follow: false },
}

export default function OrgTeamPage({ params }: { params: { orgId: string } }) {
  return <TeamPanel orgId={params.orgId} />
}
