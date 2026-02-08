'use client'


import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';

const navigation = [
  { name: 'PDPA Suite', href: '/pdpa' },
  { name: 'Free PDPA Scan', href: '/qr-scan' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Book Demo', href: '/demo' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/70">
      <nav className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex lg:flex-1 items-center">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center">
              <Image
                src="/logo.png"
                alt="BOOPPA Logo"
                width={160}
                height={48}
                priority
                className="h-12 w-auto"
              />
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
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className="text-sm font-semibold leading-6 text-gray-300 hover:text-booppa-blue transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link 
              href="/pdpa#quick-scan" 
              className="text-sm font-semibold leading-6 text-booppa-green hover:text-booppa-green/80 flex items-center"
            >
              PDPA Quick Scan <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 z-[996] bg-black/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 right-0 bottom-0 h-screen z-[997] w-full overflow-y-auto bg-gray-900 px-6 py-6">
              <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="BOOPPA Logo"
                  width={140}
                  height={42}
                  priority
                  className="h-10 w-auto"
                />
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
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-700">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/pdpa#quick-scan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-booppa-green hover:bg-gray-800"
                  >
                    PDPA Quick Scan
                  </Link>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
