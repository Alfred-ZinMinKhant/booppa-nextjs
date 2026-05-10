import type { Metadata } from 'next'
import AcceptInvitePanel from '@/components/orgs/AcceptInvitePanel'

export const metadata: Metadata = {
  title: 'Accept invite — Booppa',
  robots: { index: false, follow: false },
}

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  return <AcceptInvitePanel token={params.token} />
}
