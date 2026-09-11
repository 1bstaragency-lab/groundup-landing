/**
 * GET ?slug=... -> { authed: boolean }
 *
 * Reads this client dashboard's session cookie and verifies it
 * server-side. The dashboard page calls this on load to decide whether
 * to show the password gate or the real data.
 */
import type { Handler } from '@netlify/functions'
import { cookieNameForSlug, parseCookies, verifyToken } from './_shared/clientDashboardAuth'

const handler: Handler = async (event) => {
  const slug = (event.queryStringParameters?.slug ?? '').trim().toLowerCase()
  if (!slug) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'slug required' }) }
  }

  const cookies = parseCookies(event.headers.cookie ?? event.headers.Cookie)
  const token = cookies[cookieNameForSlug(slug)]
  const authed = verifyToken(slug, token)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authed }),
  }
}

export { handler }
