import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Booppa',
  description: 'How Booppa uses cookies and similar tracking technologies.',
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-20 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[800px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xl text-[#94a3b8]">Last updated: March 2026</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] space-y-6 text-[#64748b]">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">What Are Cookies</h2>
              <p>
                Cookies are small text files stored on your device when you visit our website.
                They help us provide a better user experience by remembering your preferences
                and understanding how you interact with our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Essential Cookies</h2>
              <p className="mb-3">These cookies are necessary for the website to function and cannot be disabled.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="text-left py-2 px-3 text-[#0f172a]">Cookie</th>
                      <th className="text-left py-2 px-3 text-[#0f172a]">Purpose</th>
                      <th className="text-left py-2 px-3 text-[#0f172a]">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-2 px-3 font-mono text-xs">token</td>
                      <td className="py-2 px-3">Authentication session</td>
                      <td className="py-2 px-3">7 days</td>
                    </tr>
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-2 px-3 font-mono text-xs">refreshToken</td>
                      <td className="py-2 px-3">Session renewal</td>
                      <td className="py-2 px-3">30 days</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-xs">cookie_consent</td>
                      <td className="py-2 px-3">Cookie preference</td>
                      <td className="py-2 px-3">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Analytics Cookies</h2>
              <p>
                We may use analytics services to understand how visitors interact with our website.
                These cookies collect information in an anonymous form and help us improve our services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Managing Cookies</h2>
              <p>
                You can control and delete cookies through your browser settings. Most browsers
                allow you to refuse cookies or delete specific cookies. Note that disabling
                essential cookies may affect the functionality of our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Contact</h2>
              <p>
                For questions about our cookie practices, contact us at{' '}
                <a href="mailto:privacy@booppa.com" className="text-[#10b981] hover:underline">
                  privacy@booppa.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
