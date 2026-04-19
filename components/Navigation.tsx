'use client'

import { Menu, X, ChevronDown, LayoutDashboard, ShieldCheck, FileText, Search, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const forVendors = [
  { name: 'Vendor Proof',  href: '/vendor-proof',  desc: 'Get verified — S$149 one-time' },
  { name: 'PDPA Scan',     href: '/pdpa',          desc: 'Data protection gap analysis' },
  { name: 'Notarization',  href: '/notarization',  desc: 'Immutable document anchoring' },
  { name: 'RFP Tools',     href: '/rfp',           desc: 'Prepare better RFP responses' },
  { name: 'Check Tenders', href: '/tender-check',  desc: 'Government tender eligibility' },
];

const forProcurements = [
  { name: 'Verify',          href: '/verify',   desc: 'Verify vendor credentials' },
  { name: 'Browse Vendors',  href: '/vendors',  desc: 'Explore the vendor network' },
  { name: 'Compare Vendors', href: '/compare',  desc: 'Side-by-side vendor comparison' },
];

const vendorLinks = [
  { name: 'Dashboard',    href: '/vendor/dashboard', icon: LayoutDashboard },
  { name: 'Vendor Proof', href: '/vendor-proof',     icon: ShieldCheck },
  { name: 'Notarization', href: '/notarization',     icon: FileText },
  { name: 'PDPA Scan',    href: '/pdpa',             icon: ShieldCheck },
  { name: 'Tender Check', href: '/tender-check',     icon: Search },
];

// Protected route prefixes — unauthenticated users must be redirected to /login
const PROTECTED = ['/vendor'];

export default function Navigation() {
  const [mobileOpen,       setMobileOpen]       = useState(false);
  const [vendorsOpen,      setVendorsOpen]      = useState(false);
  const [procurementsOpen, setProcurementsOpen] = useState(false);
  const [userOpen,         setUserOpen]         = useState(false);
  const [scrolled,         setScrolled]         = useState(false);
  const [authed,           setAuthed]           = useState<boolean | null>(null);
  const [userEmail,        setUserEmail]        = useState<string | null>(null);
  const pathname = usePathname();
  const router   = useRouter();
  const vendorsDropdownRef     = useRef<HTMLDivElement>(null);
  const procurementsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef        = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Check auth state and fetch user info.
  // Re-runs on pathname change so the nav reflects login/logout immediately
  // without requiring a full page reload.
  useEffect(() => {
    fetch('/api/auth/me')
      .then(async r => {
        if (r.ok) {
          const data = await r.json().catch(() => ({}));
          setAuthed(true);
          setUserEmail(data.email || null);
        } else {
          setAuthed(false);
          setUserEmail(null);
          // Stale/expired token — boot to login if on a protected page
          const onProtected = PROTECTED.some(p => pathname === p || pathname?.startsWith(p + '/'))
          if (onProtected) router.push('/login')
        }
      })
      .catch(() => { setAuthed(false); setUserEmail(null); });
  }, [pathname, router]);

  // Poll every 5 minutes to detect session expiry while the user is idle
  // on the same page (access token TTL is 24h).
  useEffect(() => {
    const checkSession = () => {
      fetch('/api/auth/me')
        .then(r => {
          if (!r.ok) { setAuthed(false); setUserEmail(null); }
        })
        .catch(() => {});
    };
    const id = setInterval(checkSession, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (vendorsDropdownRef.current && !vendorsDropdownRef.current.contains(e.target as Node)) {
        setVendorsOpen(false);
      }
      if (procurementsDropdownRef.current && !procurementsDropdownRef.current.contains(e.target as Node)) {
        setProcurementsOpen(false);
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

  const isVendorsActive     = forVendors.some(s => pathname?.startsWith(s.href));
  const isProcurementsActive = forProcurements.some(s => pathname?.startsWith(s.href));

  return (
    <>
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

            {/* For Vendors dropdown */}
            <div className="relative" ref={vendorsDropdownRef}>
              <button
                type="button"
                onClick={() => { setVendorsOpen(o => !o); setProcurementsOpen(false); }}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${isVendorsActive ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}
              >
                For Vendors <ChevronDown className={`h-4 w-4 transition-transform ${vendorsOpen ? 'rotate-180' : ''}`} />
              </button>
              {vendorsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  {forVendors.map(s => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setVendorsOpen(false)}
                      className="flex flex-col px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <span className={`text-sm font-medium ${pathname?.startsWith(s.href) ? 'text-[#10b981]' : 'text-white'}`}>{s.name}</span>
                      <span className="text-xs text-white/50 mt-0.5">{s.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* For Procurements dropdown */}
            <div className="relative" ref={procurementsDropdownRef}>
              <button
                type="button"
                onClick={() => { setProcurementsOpen(o => !o); setVendorsOpen(false); }}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${isProcurementsActive ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}
              >
                For Procurements <ChevronDown className={`h-4 w-4 transition-transform ${procurementsOpen ? 'rotate-180' : ''}`} />
              </button>
              {procurementsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  {forProcurements.map(s => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setProcurementsOpen(false)}
                      className="flex flex-col px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <span className={`text-sm font-medium ${pathname?.startsWith(s.href) ? 'text-[#10b981]' : 'text-white'}`}>{s.name}</span>
                      <span className="text-xs text-white/50 mt-0.5">{s.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/solutions" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/solutions') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Solutions
            </Link>

            <Link href="/opportunities" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/opportunities') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Vendor Opportunities
            </Link>

            <Link href="/pricing" className={`text-sm font-medium transition-colors ${pathname?.startsWith('/pricing') ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}>
              Pricing
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
            onClick={() => setMobileOpen(o => !o)}
          >
            <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
    </header>

    {/* Mobile drawer — rendered outside <header> to avoid backdrop-filter containing-block bug */}
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
            <MobileLink href="/vendors"       label="Network"              active={pathname?.startsWith('/vendors')}       close={() => setMobileOpen(false)} />

            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-white/30">For Vendors</p>
            </div>
            {forVendors.map(s => (
              <MobileLink key={s.href} href={s.href} label={s.name} active={pathname?.startsWith(s.href)} close={() => setMobileOpen(false)} />
            ))}

            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-white/30">For Procurements</p>
            </div>
            {forProcurements.map(s => (
              <MobileLink key={s.href} href={s.href} label={s.name} active={pathname?.startsWith(s.href)} close={() => setMobileOpen(false)} />
            ))}

            <MobileLink href="/solutions"     label="Solutions"            active={pathname?.startsWith('/solutions')}     close={() => setMobileOpen(false)} />
            <MobileLink href="/opportunities"  label="Vendor Opportunities" active={pathname?.startsWith('/opportunities')} close={() => setMobileOpen(false)} />
            <MobileLink href="/pricing"        label="Pricing"             active={pathname === '/pricing'}                close={() => setMobileOpen(false)} />
            <MobileLink href="/resources"      label="Resources"           active={pathname?.startsWith('/resources')}     close={() => setMobileOpen(false)} />
            <MobileLink href="/insights"       label="Insights"            active={pathname?.startsWith('/insights')}      close={() => setMobileOpen(false)} />

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
    </>
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
