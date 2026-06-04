/**
 * Browser-side helpers for the PDPA remediation API.
 *
 * These call the Next API proxy routes under /api/remediations/* which forward
 * to the backend with the user's HttpOnly bearer cookie attached.
 */

export type Remediation = {
  id: string
  vendor_id: string
  report_id: string | null
  finding_key: string
  label: string
  status: 'open' | 'fixed' | 'wontfix'
  confirmation_status: 'pending' | 'confirmed' | 'regressed' | 'stale'
  marked_at: string
  confirmed_at: string | null
  confirming_report_id: string | null
  notes: string | null
}

export async function listRemediationsForReport(reportId: string): Promise<Remediation[]> {
  const r = await fetch(`/api/remediations/reports/${reportId}`, { cache: 'no-store' })
  if (!r.ok) return []
  const body = await r.json().catch(() => ([]))
  return Array.isArray(body) ? (body as Remediation[]) : []
}

export async function listMyRemediations(): Promise<Remediation[]> {
  const r = await fetch('/api/remediations/me', { cache: 'no-store' })
  if (!r.ok) return []
  const body = await r.json().catch(() => ([]))
  return Array.isArray(body) ? (body as Remediation[]) : []
}

export async function markRemediation(
  reportId: string,
  findingKey: string,
  status: 'fixed' | 'wontfix' = 'fixed',
  notes?: string,
): Promise<Remediation | null> {
  const r = await fetch(`/api/remediations/reports/${reportId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finding_key: findingKey, status, notes }),
  })
  if (!r.ok) return null
  return (await r.json()) as Remediation
}

/**
 * Derive a stable finding_key from a Finding object so the UI can match the
 * backend's keys without an extra request. Mirrors the backend logic in
 * app/services/finding_keys.py for the simple `free:<check_id>` case.
 *
 * For dimension-level findings the caller should pass the known key
 * directly (e.g., "nric:leakage").
 */
export function keyFromFinding(f: { type?: string; check_id?: string }): string | null {
  const check = (f.check_id || f.type || '').toLowerCase().replace(/[^\w]+/g, '_').replace(/^_|_$/g, '')
  if (!check) return null
  return `free:${check}`
}
