'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'RFP Kit', href: '/rfp-acceleration' },
  { name: 'PDPA Scan', href: '/pdpa' },
  { name: 'Compliance', href: '/compliance' },
  { name: 'Notarization', href: '/notarization' },
  { name: 'Enterprise', href: '/enterprise' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Verify', href: '/verify' },
  { name: 'Blog', href: '/blog' },
  { name: 'Demo', href: '/demo' },
  { name: 'Support', href: '/support' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f172a]/95 shadow-md' : 'bg-[#0f172a]'} backdrop-blur-md border-b border-white/10`}>
      <nav className="mx-auto max-w-[1400px] px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex lg:flex-1 items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="BOOPPA Logo" className="h-8 w-auto" />
            </Link>
          </div>
          
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`text-sm font-medium transition-colors relative py-1 ${isActive ? 'text-[#10b981]' : 'text-white/80 hover:text-white'}`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-[-1.5rem] left-0 right-0 h-[2px] bg-[#10b981]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-[996] bg-black/80 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed top-0 left-0 right-0 bottom-0 h-screen z-[997] w-full overflow-y-auto bg-[#0f172a] px-6 py-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <img src="/logo.png" alt="BOOPPA Logo" className="h-8 w-auto" />
                </Link>
                
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-8 flow-root">
                <div className="divide-y divide-white/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`-mx-3 block rounded-lg px-3 py-3 text-base font-semibold transition-colors ${pathname === item.href ? 'text-[#10b981] bg-white/5' : 'text-white hover:bg-white/5'}`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
