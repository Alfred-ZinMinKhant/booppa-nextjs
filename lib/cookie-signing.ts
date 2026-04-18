function getSecret(): string {
  const secret = process.env.COOKIE_SIGNING_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('COOKIE_SIGNING_SECRET must be set in production')
  }
  return 'dev-cookie-secret-do-not-use-in-prod'
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes.buffer as ArrayBuffer
}

export async function signCookieValue(value: string): Promise<string> {
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return `${value}.${bufToHex(sig)}`
}

export async function verifyAndParseCookieValue(signed: string): Promise<string | null> {
  const dotIndex = signed.lastIndexOf('.')
  if (dotIndex === -1) return null
  const value = signed.substring(0, dotIndex)
  const sig = signed.substring(dotIndex + 1)
  try {
    const key = await getKey()
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBuf(sig),
      new TextEncoder().encode(value),
    )
    return valid ? value : null
  } catch {
    return null
  }
}
