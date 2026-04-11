'use client'

import { Menu, X, ChevronDown, LayoutDashboard, ShieldCheck, FileText, Search, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const solutions = [
  { name: 'For Vendors',     href: '/solutions/vendors',    desc: 'Claim, verify, and win more contracts' },
  { name: 'For Procurement', href: '/solutions/procurement', desc: 'Reduce vendor risk, evaluate faster' },
  { name: 'RFP Tools',       href: '/rfp',                  desc: 'Prepare better RFP responses' },
  { name: 'Vendor Proof',    href: '/vendor-proof',         desc: 'Get verified — S$149 one-time' },
  { name: 'PDPA Scan',       href: '/pdpa',                 desc: 'Data protection gap analysis' },
  { name: 'Notarization',    href: '/notarization',         desc: 'Immutable document anchoring' },
  { name: 'Tender Check',    href: '/tender-check',         desc: 'Government tender eligibility' },
  { name: 'Opportunities',   href: '/opportunities',        desc: 'Live GeBIZ open tenders' },
];

const vendorLinks = [
  { name: 'Dashboard',    href: '/vendor/dashboard', icon: LayoutDashboard },
  { name: 'Vendor Proof', href: '/vendor-proof',     icon: ShieldCheck },
  { name: 'Notarization', href: '/notarization',     icon: FileText },
  { name: 'PDPA Scan',    href: '/pdpa',             icon: ShieldCheck },
  { name: 'Tender Check', href: '/tender-check',     icon: Search },
];

export default function Navigation() {
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [userOpen,      setUserOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [authed,        setAuthed]        = useState<boolean | null>(null);
  const [userEmail,     setUserEmail]     = useState<string | null>(null);
  const pathname = usePathname();
  const router   = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Check auth state and fetch user info
  useEffect(() => {
    fetch('/api/auth/me')
      .then(async r => {
        if (r.ok) {
          const data = await r.json().catch(() => ({}));
          setAuthed(true);
          setUserEmail(data.email || null);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthed(false);
    router.push('/login');
  };

  const isSolutionActive = solutions.some(s => pathname?.startsWith(s.href));

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b border-white/10 ${scrolled ? 'bg-[#0f172a]/95 shadow-md' : 'bg-[#0f172a]'}`}>
      <nav className="mx-auto max-w-[1400px] px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="BOOPPA" className="h-8 w-auto" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-x-8">
            <Link href="/vendors" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/vendors') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Network
            </Link>

            {/* Solutions dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setSolutionsOpen(o => !o)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${isSolutionActive ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}
              >
                Solutions <ChevronDown className={`h-4 w-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  {solutions.map(s => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setSolutionsOpen(false)}
                      className="flex flex-col px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <span className={`text-sm font-medium ${pathname?.startsWith(s.href) ? 'text-[#10b981]' : 'text-white'}`}>{s.name}</span>
                      <span className="text-xs text-white/50 mt-0.5">{s.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/compare" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/compare') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Compare
            </Link>

            <Link href="/pricing" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/pricing') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Pricing
            </Link>

            <Link href="/verify" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/verify') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Verify
            </Link>

            <Link href="/resources" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/resources') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Resources
            </Link>

            <Link href="/insights" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/insights') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Insights
            </Link>
          </div>

          {/* Desktop auth actions */}
          <div className="hidden lg:flex items-center gap-3">
            {authed === true ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-3.5 w-3.5 text-[#10b981]" />
                  </div>
                  <span className="text-sm font-medium text-white/80 max-w-[140px] truncate">
                    {userEmail ? userEmail.split('@')[0] : 'My Account'}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>

                {userOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {/* Email header */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs text-white/40">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{userEmail || 'Vendor'}</p>
                    </div>

                    {/* Vendor tool links */}
                    <div className="py-1">
                      {vendorLinks.map(({ name, href, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            pathname?.startsWith(href) ? 'text-[#10b981] bg-[#10b981]/10' : 'text-white/80 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0 opacity-70" />
                          {name}
                        </Link>
                      ))}
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-white/10 py-1">
                      <button
                        type="button"
                        onClick={() => { setUserOpen(false); handleLogout(); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-[#10b981] text-white text-sm font-semibold rounded-lg hover:bg-[#059669] transition-colors"
                >
                  Claim your Profile
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-400"
            onClick={() => setMobileOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[996] bg-black/80 cursor-default"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-0 z-[997] flex flex-col bg-[#0f172a] px-6 py-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <img src="/logo.png" alt="BOOPPA" className="h-8 w-auto" />
                </Link>
                <button type="button" className="-m-2.5 p-2.5 text-gray-400" onClick={() => setMobileOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-1">
                <MobileLink href="/vendors"    label="Network"   active={pathname?.startsWith('/vendors')}   close={() => setMobileOpen(false)} />
                <MobileLink href="/compare"    label="Compare"   active={pathname === '/compare'}            close={() => setMobileOpen(false)} />
                <MobileLink href="/pricing"    label="Pricing"   active={pathname === '/pricing'}            close={() => setMobileOpen(false)} />
                <MobileLink href="/verify"     label="Verify"    active={pathname?.startsWith('/verify')}    close={() => setMobileOpen(false)} />
                <MobileLink href="/resources"  label="Resources" active={pathname?.startsWith('/resources')} close={() => setMobileOpen(false)} />
                <MobileLink href="/insights"   label="Insights"  active={pathname?.startsWith('/insights')}  close={() => setMobileOpen(false)} />

                <div className="pt-4 pb-1">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-white/30">Solutions</p>
                </div>
                {solutions.map(s => (
                  <MobileLink key={s.href} href={s.href} label={s.name} active={pathname?.startsWith(s.href)} close={() => setMobileOpen(false)} />
                ))}

                <div className="pt-6 border-t border-white/10 space-y-1">
                  {authed === true ? (
                    <>
                      <div className="px-3 py-2 mb-1">
                        <p className="text-xs text-white/40">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{userEmail || 'Vendor'}</p>
                      </div>
                      {vendorLinks.map(({ name, href }) => (
                        <MobileLink key={href} href={href} label={name} active={pathname?.startsWith(href)} close={() => setMobileOpen(false)} />
                      ))}
                      <button
                        type="button"
                        onClick={() => { setMobileOpen(false); handleLogout(); }}
                        className="-mx-3 block w-full text-left rounded-lg px-3 py-3 text-base font-semibold text-white/50 hover:bg-white/5 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <MobileLink href="/login" label="Sign In" active={pathname === '/login'} close={() => setMobileOpen(false)} />
                      <MobileLink href="/auth/register" label="Claim your Profile" active={false} close={() => setMobileOpen(false)} highlight />
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}

function MobileLink({ href, label, active, close, highlight }: {
  href: string; label: string; active?: boolean | null; close: () => void; highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={close}
      className={`-mx-3 block rounded-lg px-3 py-3 text-base font-semibold transition-colors ${
        highlight      ? 'text-[#10b981] bg-[#10b981]/10' :
        active         ? 'text-[#10b981] bg-white/5' :
        'text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );
}
