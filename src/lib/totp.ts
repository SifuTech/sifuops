import crypto from 'crypto'

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(str: string): Buffer {
  const s = str.toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '')
  let bits = 0, value = 0
  const out: number[] = []
  for (let i = 0; i < s.length; i++) {
    value = (value << 5) | BASE32.indexOf(s[i])
    bits += 5
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8 }
  }
  return Buffer.from(out)
}

export function generateSecret(): string {
  const bytes = crypto.randomBytes(20)
  let result = '', bits = 0, value = 0
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) { result += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5 }
  }
  if (bits > 0) result += BASE32[(value << (5 - bits)) & 31]
  return result
}

function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret)
  const buf = Buffer.alloc(8)
  let tmp = counter
  for (let i = 7; i >= 0; i--) { buf[i] = tmp & 0xff; tmp = Math.floor(tmp / 256) }
  const hmac = crypto.createHmac('sha1', key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3]
  return String(code % 1_000_000).padStart(6, '0')
}

export function verifyCode(token: string, secret: string): boolean {
  const step = Math.floor(Date.now() / 30_000)
  for (let i = -1; i <= 1; i++) {
    if (hotp(secret, step + i) === token) return true
  }
  return false
}

export function keyuri(username: string, secret: string): string {
  const params = new URLSearchParams({ secret, issuer: 'SifuOps', algorithm: 'SHA1', digits: '6', period: '30' })
  return `otpauth://totp/${encodeURIComponent('SifuOps:' + username)}?${params.toString()}`
}
