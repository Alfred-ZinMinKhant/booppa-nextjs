// Client-side fetch wrapper for admin-panel pages that call the admin proxy
// (app/api/admin/api/[...path]/route.ts). Distinct from the server-side
// lib/adminFetch.ts (which forwards the cookie as a Bearer to the backend).
//
// The proxy — and the backend behind it — return 401 once the admin session
// lapses. Middleware only guards page *navigations*; a fetch fired from an
// already-open admin page just got a bare "Unauthorized" that looked like the
// feature itself was broken (this is what made "PDPA test checkout" appear dead).
//
// On any 401 we bounce the admin to /admin/login with an ?expired=1 flag so the
// login page can explain what happened, instead of surfacing a per-feature error.
export async function adminApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, { cache: 'no-store', ...init })
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/admin/login?expired=1'
  }
  return res
}
