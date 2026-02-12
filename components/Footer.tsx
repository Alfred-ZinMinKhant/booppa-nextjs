import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e2e8f0] pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="footer-column">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="BOOPPA Logo" className="h-8 w-auto" />
            </div>
            <p className="text-[#64748b] text-sm max-w-xs">
              Evidence infrastructure for Singapore compliance operations.
            </p>
          </div>

          <div className="footer-column">
            <h4 className="font-bold text-[#0f172a] mb-6">Services</h4>
            <ul className="space-y-4">
              <li><Link href="/pdpa" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">PDPA Scan</Link></li>
              <li><Link href="/compliance" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Compliance Monitoring</Link></li>
              <li><Link href="/notarization" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Evidence Notarization</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="font-bold text-[#0f172a] mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/enterprise" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Enterprise Solutions</Link></li>
              <li><Link href="/pricing" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Pricing</Link></li>
              <li><Link href="/blog" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Blog</Link></li>
              <li><Link href="/support" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Support</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="font-bold text-[#0f172a] mb-6">Tools</h4>
            <ul className="space-y-4">
              <li><Link href="/verify" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Verify Evidence</Link></li>
              <li><Link href="/demo" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Request Demo</Link></li>
              <li><Link href="/support" className="text-[#64748b] hover:text-[#10b981] transition-colors text-sm">Open Ticket</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e2e8f0] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="footer-bottom-text">
            <p className="text-[#94a3b8] text-xs mb-2">
              BOOPPA provides evidence generation tools. Not regulatory certification or legal advice.
            </p>
            <p className="text-[#64748b] text-sm">
              © 2024 BOOPPA. Singapore-based compliance infrastructure.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
