'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { config as appConfig } from '@/lib/config';

const solutions = [
  { name: 'RFP Kit',        href: '/rfp-acceleration',   desc: 'Blockchain-verified RFP evidence' },
  { name: 'Compliance',     href: '/compliance',          desc: 'ISO 27001 & SOC 2 readiness' },
  { name: 'PDPA Scan',      href: '/pdpa',                desc: 'Data protection gap analysis' },
  { name: 'Notarization',   href: '/notarization',        desc: 'Immutable document anchoring' },
  { name: 'Tender Check',   href: '/tender-check',        desc: 'Government tender eligibility' },
  { name: 'Opportunities',  href: '/opportunities',        desc: 'Live GeBIZ open tenders' },
  { name: 'Supply Chain',   href: '/supply-chain',        desc: 'Vendor risk screening' },
];

export default function Navigation() {
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [authed,        setAuthed]        = useState<boolean | null>(null); // null = unknown
  const pathname = usePathname();
  const router   = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Check auth state via /api/v1/auth/me
  useEffect(() => {
    fetch(`${appConfig.apiUrl}/api/v1/auth/me`, { credentials: 'include' })
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
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
              Marketplace
            </Link>

            {/* Solutions dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
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
          </div>

          {/* Desktop auth actions */}
          <div className="hidden lg:flex items-center gap-3">
            {authed === true ? (
              <>
                <Link
                  href="/vendor/dashboard"
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/trial"
                  className="px-4 py-2 bg-[#10b981] text-white text-sm font-semibold rounded-lg hover:bg-[#059669] transition-colors"
                >
                  Get Started
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
            <div className="fixed inset-0 z-[996] bg-black/80" onClick={() => setMobileOpen(false)} />
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
                <MobileLink href="/vendors"          label="Marketplace"         active={pathname?.startsWith('/vendors')}          close={() => setMobileOpen(false)} />
                <MobileLink href="/compare"           label="Compare"             active={pathname === '/compare'}                   close={() => setMobileOpen(false)} />
                <MobileLink href="/pricing"           label="Pricing"             active={pathname === '/pricing'}                   close={() => setMobileOpen(false)} />
                <MobileLink href="/verify"            label="Verify"              active={pathname?.startsWith('/verify')}           close={() => setMobileOpen(false)} />

                <div className="pt-4 pb-1">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-white/30">Solutions</p>
                </div>
                {solutions.map(s => (
                  <MobileLink key={s.href} href={s.href} label={s.name} active={pathname?.startsWith(s.href)} close={() => setMobileOpen(false)} />
                ))}

                <div className="pt-6 border-t border-white/10 space-y-1">
                  {authed === true ? (
                    <>
                      <MobileLink href="/vendor/dashboard" label="Dashboard" active={pathname?.startsWith('/vendor/dashboard')} close={() => setMobileOpen(false)} />
                      <button
                        onClick={() => { setMobileOpen(false); handleLogout(); }}
                        className="-mx-3 block w-full text-left rounded-lg px-3 py-3 text-base font-semibold text-white/50 hover:bg-white/5 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <MobileLink href="/login" label="Sign In" active={pathname === '/login'} close={() => setMobileOpen(false)} />
                      <MobileLink href="/trial" label="Get Started" active={false} close={() => setMobileOpen(false)} highlight />
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
