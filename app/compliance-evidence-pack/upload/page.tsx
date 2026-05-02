'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Legacy route — redirect to the unified bundle notarize page.
export default function LegacyComplianceEvidencePackUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  useEffect(() => {
    const sid = searchParams.get('session_id')
    const qs = new URLSearchParams({ bundle: 'compliance_evidence_pack' })
    if (sid) qs.set('session_id', sid)
    router.replace(`/bundle/notarize?${qs.toString()}`)
  }, [router, searchParams])
  return null
}
