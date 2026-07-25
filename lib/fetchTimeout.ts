// Shared fetch timeout so a slow/unreachable backend can't hang an SSR request
// indefinitely. Every server-side call to the FastAPI backend should go through
// this instead of a bare `fetch`.
//
// AbortSignal.timeout() is available on Node 18+ (the app runs on Node 20).
// An existing caller-supplied `signal` is respected — we combine it with the
// timeout via AbortSignal.any() when present.

export const DEFAULT_BACKEND_TIMEOUT_MS = 10_000

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_BACKEND_TIMEOUT_MS,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal
  return fetch(input, { ...init, signal })
}
