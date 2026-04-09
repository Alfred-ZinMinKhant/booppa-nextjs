import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | BOOPPA',
  description: 'How Booppa uses cookies and similar tracking technologies. Effective March 1, 2026.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#0f172a] mb-3">{title}</h2>
      <div className="text-[#64748b] space-y-3 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function CookieTable({ rows }: { rows: { name: string; purpose: string; duration: string; provider: string }[] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-xs border border-[#e2e8f0] rounded-lg overflow-hidden">
        <thead className="bg-[#f8fafc]">
          <tr>
            <th className="text-left py-2 px-3 font-semibold text-[#0f172a] border-b border-[#e2e8f0]">Cookie</th>
            <th className="text-left py-2 px-3 font-semibold text-[#0f172a] border-b border-[#e2e8f0]">Purpose</th>
            <th className="text-left py-2 px-3 font-semibold text-[#0f172a] border-b border-[#e2e8f0]">Provider</th>
            <th className="text-left py-2 px-3 font-semibold text-[#0f172a] border-b border-[#e2e8f0]">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[#e2e8f0] last:border-0">
              <td className="py-2 px-3 font-mono text-[#0f172a]">{r.name}</td>
              <td className="py-2 px-3">{r.purpose}</td>
              <td className="py-2 px-3">{r.provider}</td>
              <td className="py-2 px-3 whitespace-nowrap">{r.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-sm text-[#10b981] font-medium">Effective Date: March 1, 2026</p>
          <p className="text-xs text-white/40 mt-1">Booppa Smart Care LLC · 1209 Orange Street, Wilmington, Delaware 19801, USA</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8">

            <Section title="1. What Are Cookies">
              <p>Cookies are small text files placed on your device when you visit a website. Booppa uses cookies and similar technologies (local storage, session storage) to operate the platform, maintain your session, prevent fraud, and understand aggregate usage patterns.</p>
              <p>This policy applies to all cookies set by booppa.io and its subdomains.</p>
            </Section>

            <Section title="2. Cookie Categories">
              <p>We use four categories of cookies. Categories 1 and 2 are strictly necessary and cannot be disabled. Categories 3 and 4 are optional — you may withdraw consent at any time via your browser settings or our cookie preference centre.</p>
            </Section>

            <Section title="2a. Strictly Necessary Cookies">
              <p>Required for the platform to function. No consent required under ePrivacy Directive Article 5(3). Cannot be disabled without breaking core functionality.</p>
              <CookieTable rows={[
                { name: 'token', purpose: 'JWT authentication session', provider: 'Booppa', duration: '7 days' },
                { name: 'refreshToken', purpose: 'Session renewal', provider: 'Booppa', duration: '30 days' },
                { name: 'cookie_consent', purpose: 'Records your cookie preferences', provider: 'Booppa', duration: '1 year' },
                { name: '__stripe_mid', purpose: 'Stripe payment fraud prevention', provider: 'Stripe', duration: '1 year' },
                { name: '__stripe_sid', purpose: 'Stripe session tracking', provider: 'Stripe', duration: '30 minutes' },
              ]} />
            </Section>

            <Section title="2b. Bot Protection Cookies (Cloudflare Turnstile)">
              <p>Booppa uses <strong className="text-[#0f172a]">Cloudflare Turnstile</strong> on authentication and form submission pages to protect against automated abuse and credential stuffing. Turnstile operates as a privacy-preserving CAPTCHA alternative that does not profile users for advertising purposes.</p>
              <CookieTable rows={[
                { name: 'cf_clearance', purpose: 'Cloudflare bot verification challenge passed', provider: 'Cloudflare', duration: 'Session / 30 minutes' },
                { name: '__cf_bm', purpose: 'Cloudflare Bot Management — distinguishes humans from bots', provider: 'Cloudflare', duration: '30 minutes' },
              ]} />
              <p className="text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 mt-2">
                Cloudflare Turnstile does not use tracking pixels or fingerprinting for advertising. Data processed by Cloudflare is governed by the <strong className="text-[#0f172a]">Cloudflare Privacy Policy</strong> and the Cloudflare–Booppa Data Processing Addendum. Cloudflare may process challenge data in the United States or EU.
              </p>
            </Section>

            <Section title="2c. Functional Cookies">
              <p>Enhance platform usability by remembering your preferences. These cookies do not track you across third-party websites.</p>
              <CookieTable rows={[
                { name: 'locale', purpose: 'User language / region preference', provider: 'Booppa', duration: '1 year' },
                { name: 'ui_theme', purpose: 'Light/dark mode preference', provider: 'Booppa', duration: '1 year' },
              ]} />
            </Section>

            <Section title="2d. Analytics Cookies">
              <p>Used to understand aggregate usage patterns and improve platform performance. Analytics data is anonymized or pseudonymized; individual users are not identified.</p>
              <CookieTable rows={[
                { name: '_sentry-sc', purpose: 'Sentry error session context (anonymized)', provider: 'Sentry', duration: 'Session' },
              ]} />
              <p className="text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 mt-2">
                Booppa does not currently use Google Analytics, Meta Pixel, or any third-party behavioral analytics service. If this changes, this policy will be updated and registered Users notified with at least 14 days&apos; notice.
              </p>
            </Section>

            <Section title="3. Marketing and Advertising Cookies">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-900 font-medium text-xs uppercase tracking-wide mb-1">No Retargeting or Advertising Cookies</p>
                <p className="text-amber-800">Booppa does not use third-party advertising cookies, retargeting pixels, cross-site tracking technologies, or advertising networks of any kind. We do not share your browsing behavior with advertisers. This applies to all users including EU/UK, Singapore, and California residents.</p>
              </div>
            </Section>

            <Section title="4. EU/UK Users — Consent Banner">
              <p>For users accessing from the EU or UK, non-essential cookies (categories 2c and 2d) are not set until you have provided consent via our cookie banner, in accordance with the EU ePrivacy Directive and UK PECR. You may withdraw consent at any time by clearing cookies in your browser or clicking "Manage Preferences" in the footer.</p>
              <p>Legal basis for strictly necessary cookies: Legitimate interest (Article 6(1)(f) GDPR) — necessary for secure platform operation. Legal basis for analytics cookies where deployed: Consent (Article 6(1)(a) GDPR).</p>
            </Section>

            <Section title="5. Singapore Users">
              <p>Use of cookies on the Booppa platform constitutes processing of personal data under the PDPA where cookies store or are associated with personal identifiers. Booppa processes this data on the basis of contractual necessity (authentication cookies) and legitimate interests (security and analytics cookies), in accordance with the PDPA 2012 as amended.</p>
            </Section>

            <Section title="6. Managing Your Cookie Preferences">
              <p>You can control cookies at any time through your browser settings. Most browsers allow you to:</p>
              <ul className="space-y-1 mt-1">
                <li className="ml-4 list-disc">View and delete cookies currently stored</li>
                <li className="ml-4 list-disc">Block cookies from specific websites</li>
                <li className="ml-4 list-disc">Block all third-party cookies</li>
                <li className="ml-4 list-disc">Set preferences for specific cookie types</li>
              </ul>
              <p className="mt-2 text-xs">Note: Blocking strictly necessary cookies (category 2a) will prevent you from logging in and using core platform features.</p>
            </Section>

            <Section title="7. Third-Party Cookie Policies">
              <p>Third-party sub-processors whose cookies are set on the Booppa platform maintain their own privacy and cookie policies:</p>
              <ul className="space-y-1 mt-1">
                <li className="ml-4 list-disc"><strong className="text-[#0f172a]">Stripe:</strong> stripe.com/privacy</li>
                <li className="ml-4 list-disc"><strong className="text-[#0f172a]">Cloudflare:</strong> cloudflare.com/privacypolicy</li>
                <li className="ml-4 list-disc"><strong className="text-[#0f172a]">Sentry:</strong> sentry.io/privacy</li>
              </ul>
            </Section>

            <Section title="8. Changes to This Policy">
              <p>We will update this policy when we introduce new cookies or remove existing ones. Registered Users will be notified by email at least 14 days before material changes take effect.</p>
            </Section>

            <div className="pt-4 border-t border-[#e2e8f0] text-xs text-[#94a3b8] space-y-1">
              <p>Contact: <a href="mailto:privacy@booppa.io" className="underline text-[#10b981]">privacy@booppa.io</a></p>
              <p>Also see: <Link href="/privacy" className="underline text-[#10b981]">Privacy Policy</Link> · <Link href="/terms" className="underline text-[#10b981]">Terms of Service</Link> · <Link href="/dpo" className="underline text-[#10b981]">DPO Contact</Link></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
