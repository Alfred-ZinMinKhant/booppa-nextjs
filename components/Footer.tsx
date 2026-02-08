
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="BOOPPA Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Enterprise blockchain compliance for Singapore.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/pdpa" className="hover:text-booppa-blue transition-colors">PDPA Compliance</Link></li>
              <li><Link href="/qr-scan" className="hover:text-teal-400 transition-colors">Free PDPA Scan</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Book Demo</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security & Compliance</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <Link href="/support" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> Submit a support ticket
              </Link>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +65 1234 5678
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>16192 Coastal Highway<br />Lewes, Delaware 19958, USA</span>
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between text-sm text-gray-500">
            <div>
              <p className="font-medium text-white">Booppa Smart Care LLC</p>
              <p className="mt-1">Registered in Delaware • File No. 7994123</p>
              <p className="text-xs mt-2">© 2025 Booppa Smart Care LLC • All rights reserved</p>
              <p className="text-xs mt-2 text-gray-400">
                Designed to support compliance processes. Not a regulatory certification.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-xs">MTCS Level 1 Aligned Cloud Security • AWS Singapore • Polygon Blockchain</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
