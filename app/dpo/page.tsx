import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Protection Officer | Booppa',
  description: 'Contact information for Booppa\'s Data Protection Officer under the PDPA.',
}

export default function DPOPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-20 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[800px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Data Protection Officer</h1>
          <p className="text-xl text-[#94a3b8]">Contact details under the Personal Data Protection Act (PDPA)</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-[800px] mx-auto prose prose-slate">
          <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">About Our DPO</h2>
              <p className="text-[#64748b]">
                In compliance with the Personal Data Protection Act 2012 (PDPA), Booppa has appointed a
                Data Protection Officer (DPO) to oversee our data protection policies and practices.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Responsibilities</h2>
              <ul className="text-[#64748b] space-y-2">
                <li>Ensuring compliance with the PDPA and related regulations</li>
                <li>Handling data protection queries and complaints</li>
                <li>Managing data access and correction requests</li>
                <li>Overseeing data breach management procedures</li>
                <li>Conducting data protection impact assessments</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Contact</h2>
              <p className="text-[#64748b]">
                If you have any questions about how we handle your personal data, or if you wish to
                make a data access or correction request, please contact our DPO:
              </p>
              <div className="mt-4 p-4 bg-[#f8fafc] rounded-xl">
                <p className="text-[#0f172a] font-medium">Data Protection Officer</p>
                <p className="text-[#64748b]">Email: dpo@booppa.com</p>
                <p className="text-[#64748b]">Subject line: &quot;PDPA Request&quot;</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Response Timeline</h2>
              <p className="text-[#64748b]">
                We will respond to all data protection requests within 30 business days of receipt,
                as required by the PDPA. Complex requests may require additional time, and we will
                inform you if an extension is needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
