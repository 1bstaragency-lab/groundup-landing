/**
 * URL shortener redirect handler
 *
 * URL: https://groundupapp.com/go/:code
 * (Netlify redirect: /go/:code  →  /.netlify/functions/go/:code)
 *
 * Looks up the code in the short_links table and 302-redirects.
 * Deletes expired links on read to keep the table clean.
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL         ?? ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ??
                     process.env.VITE_SUPABASE_ANON_KEY    ?? ''

export const handler: Handler = async (event) => {
  // Extract code from path: /.netlify/functions/go/abc123 or /go/abc123
  const parts = (event.path ?? '').split('/')
  const code  = parts[parts.length - 1]?.trim()

  const fallback = 'https://groundupapp.com/pricing'

  if (!code || !SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 302, headers: { Location: fallback }, body: '' }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const { data } = await supabase
    .from('short_links')
    .select('url, expires_at')
    .eq('code', code)
    .maybeSingle()

  // Clean up expired or missing links
  if (!data || new Date(data.expires_at) < new Date()) {
    if (data) supabase.from('short_links').delete().eq('code', code)
    return { statusCode: 302, headers: { Location: fallback }, body: '' }
  }

  return {
    statusCode: 302,
    headers: { Location: data.url, 'Cache-Control': 'no-store' },
    body: '',
  }
}
