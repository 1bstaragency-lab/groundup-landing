/**
 * POST { slug, password } -> checks the password against
 * CLIENT_DASHBOARD_PASSWORD_<SLUG> (server-side only) and, on match, sets
 * a signed httpOnly session cookie scoped to that client's dashboard.
 *
 * See _shared/clientDashboardAuth.ts for the token/cookie shape.
 */
import type { Handler } from '@netlify/functions'
import { envKeyForSlug, issueToken, buildSessionCookie } from './_shared/clientDashboardAuth'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let body: { slug?: string; password?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) } }

  const slug = (body.slug ?? '').trim().toLowerCase()
  const password = body.password ?? ''

  if (!slug || !password) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: 'slug and password required' }) }
  }

  const expected = process.env[envKeyForSlug(slug)]

  if (!expected) {
    // No password configured for this client yet — fail closed, but say so
    // distinctly so it's obvious in testing that this is a config gap, not
    // a wrong password.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'not_configured' }),
    }
  }

  if (password !== expected) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'wrong_password' }),
    }
  }

  const { token, expires } = issueToken(slug)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': buildSessionCookie(slug, token, expires),
    },
    body: JSON.stringify({ ok: true }),
  }
}

export { handler }
