'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, Briefcase, Users, UserCircle, Activity,
  Upload, Inbox, LifeBuoy, LogOut, Brain, Newspaper, BookOpen,
  ScrollText, GraduationCap, FlaskConical, RefreshCw,
} from 'lucide-react'

const NAV: { group: string; items: { href: string; label: string; icon: any }[] }[] = [
  {
    group: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/intelligence', label: 'Intelligence', icon: Brain },
      { href: '/admin/agent-dashboard', label: 'Agent Leads', icon: Activity },
    ],
  },
  {
    group: 'CMS Content',
    items: [
      { href: '/admin/content', label: 'Overview', icon: FileText },
      { href: '/admin/content/blogs', label: 'Blogs', icon: Newspaper },
      { href: '/admin/content/rfp-tips', label: 'RFP Tips', icon: ScrollText },
      { href: '/admin/content/compliance', label: 'Compliance', icon: BookOpen },
      { href: '/admin/content/vendor-guides', label: 'Vendor Guides', icon: GraduationCap },
    ],
  },
  {
    group: 'Operations',
    items: [
      { href: '/admin/users', label: 'Users', icon: UserCircle },
      { href: '/admin/tenders', label: 'Tenders', icon: Briefcase },
      { href: '/admin/vendors', label: 'Vendors', icon: Users },
      { href: '/admin/import', label: 'Import CSV', icon: Upload },
      { href: '/admin/bookings', label: 'Demo Bookings', icon: Inbox },
      { href: '/admin/tickets', label: 'Support Tickets', icon: LifeBuoy },
      { href: '/admin/failed-reports', label: 'Failed Reports', icon: RefreshCw },
    ],
  },
  {
    group: 'QA',
    items: [
      { href: '/admin/test-checkout', label: 'Test Checkout', icon: FlaskConical },
      { href: '/admin/pdpa-bulk-scan', label: 'PDPA Bulk Scan', icon: FlaskConical },
      { href: '/admin/validation-matrix', label: 'Validation Matrix', icon: FlaskConical },
    ],
  },
]

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      <aside className="w-60 shrink-0 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="px-5 py-5 border-b border-neutral-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Booppa" width={28} height={28} className="rounded-md" />
            <span className="font-bold tracking-tight">BOOPPA · ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 text-sm">
          {NAV.map(group => (
            <div key={group.group} className="mb-5">
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                {group.group}
              </div>
              <ul>
                {group.items.map(item => {
                  const Icon = item.icon
                  const active =
                    pathname === item.href ||
                    (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 transition ${
                          active
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="p-6 sm:p-8">{children}</div>
      </main>
    </div>
  )
}
