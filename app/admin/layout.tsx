import type { ReactNode } from 'react'
import AdminShell from './AdminShell'

export const metadata = {
  title: 'BOOPPA Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
