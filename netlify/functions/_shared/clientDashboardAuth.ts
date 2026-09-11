/**
 * Client dashboard auth — lightweight, server-side password gate for
 * `/client/:slug` pages (e.g. /client/staybarii-bounce).
 *
 * These are one-off campaign clients, not platform users — they don't
 * have a Supabase account, so this intentionally does NOT use Supabase
 * auth. Instead: one shared password per client (an env var), checked
 * server-side, and a signed httpOnly cookie on success. The password
 * itself and the signing secret never reach the browser bundle.
 *
 * Env vars:
 *   CLIENT_DASHBOARD_SECRET               — HMAC signing key (one, shared across all clients)
 *   CLIENT_DASHBOARD_PASSWORD_<SLUG>      — per-client password, SLUG = slug uppercased with
 *                                           non-alphanumerics replaced by "_"
 *                                           e.g. staybarii-bounce -> CLIENT_DASHBOARD_PASSWORD_STAYBARII_BOUNCE
 *
 * Token shape: `${slug}.${expiryEpochSeconds}.${hmacHex}`
 * HMAC is over `${slug}.${expiryEpochSeconds}` using CLIENT_DASHBOARD_SECRET.
 */
import { createHmac, timingSafeEqual } from 'crypto'

const SESSION_DAYS = 30

export function envKeyForSlug(slug: string): string {
  return `CLIENT_DASHBOARD_PASSWORD_${slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
}

export function cookieNameForSlug(slug: string): string {
  return `cd_auth_${slug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
}

function secret(): string {
  const s = process.env.CLIENT_DASHBOARD_SECRET
  if (!s) throw new Error('CLIENT_DASHBOARD_SECRET is not set')
  return s
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex')
}

export function issueToken(slug: string): { token: string; expires: Date } {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60
  const payload = `${slug}.${expiresAt}`
  const token = `${payload}.${sign(payload)}`
  return { token, expires: new Date(expiresAt * 1000) }
}

export function verifyToken(slug: string, token: string | undefined | null): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [tokenSlug, expiresAtStr, mac] = parts
  if (tokenSlug !== slug) return false

  const expiresAt = parseInt(expiresAtStr, 10)
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false

  const expectedMac = sign(`${tokenSlug}.${expiresAtStr}`)
  const a = Buffer.from(mac)
  const b = Buffer.from(expectedMac)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Parse a raw `Cookie` request header into a name -> value map. */
export function parseCookies(header: string | undefined | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k) out[k] = decodeURIComponent(v)
  }
  return out
}

export function buildSessionCookie(slug: string, token: string, expires: Date): string {
  const attrs = [
    `${cookieNameForSlug(slug)}=${encodeURIComponent(token)}`,
    `Path=/`,
    `Expires=${expires.toUTCString()}`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
  ]
  return attrs.join('; ')
}
