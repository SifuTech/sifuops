const COOKIE_NAME = 'sifuops_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters')
  return s
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

function toBase64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function fromBase64url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

export async function createSessionToken(username: string): Promise<string> {
  const payload = toBase64url(
    new TextEncoder().encode(JSON.stringify({ u: username, exp: Date.now() + SESSION_DURATION_MS })),
  )
  const key = await getKey()
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)) as ArrayBuffer)
  return `${payload}.${toBase64url(sig)}`
}

export async function verifySessionToken(token: string): Promise<{ username: string } | null> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return null
    const payload = token.slice(0, dot)
    const sig = fromBase64url(token.slice(dot + 1))
    const key = await getKey()
    const valid = await crypto.subtle.verify('HMAC', key, sig.buffer as ArrayBuffer, new TextEncoder().encode(payload).buffer as ArrayBuffer)
    if (!valid) return null
    const data = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as { u: string; exp: number }
    if (data.exp < Date.now()) return null
    return { username: data.u }
  } catch {
    return null
  }
}

export function checkCredentials(username: string, password: string): boolean {
  const validUser = process.env.AUTH_USERNAME
  const validPass = process.env.AUTH_PASSWORD
  if (!validUser || !validPass) return false
  return username === validUser && password === validPass
}

export { COOKIE_NAME }
