/**
 * Returns a vCard (.vcf) for "uP" so new iMessage users can save the contact.
 * URL: https://groundupapp.com/.netlify/functions/up-vcard
 *
 * Env vars:
 *   BLOOIO_NUMBER  — the Blooio iMessage number (e.g. +13051234567)
 *   BLOOIO_API_KEY — fallback: fetch the number from Blooio's API
 */
import type { Handler } from '@netlify/functions'

const BLOOIO_NUMBER  = process.env.BLOOIO_NUMBER  ?? ''
const BLOOIO_API_KEY = process.env.BLOOIO_API_KEY ?? ''

// Avatar pre-encoded at build time — 200×200 JPEG, ~7 KB
// Regenerate with: sips -s format jpeg -s formatOptions 80 -z 200 200 public/up-avatar.png --out /tmp/up-avatar-small.jpg && base64 -i /tmp/up-avatar-small.jpg | tr -d '\n'
const PHOTO_B64 = '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'

async function fetchBlooioNumber(): Promise<string> {
  if (!BLOOIO_API_KEY) return ''
  try {
    const r = await fetch('https://backend.blooio.com/v2/api/me/numbers', {
      headers: { Authorization: `Bearer ${BLOOIO_API_KEY}` },
    })
    if (!r.ok) return ''
    const data = await r.json() as { numbers?: Array<{ phone_number: string; is_active: boolean }> }
    const active = (data.numbers ?? []).find(n => n.is_active)
    return active?.phone_number ?? ''
  } catch {
    return ''
  }
}

export const handler: Handler = async () => {
  const number = BLOOIO_NUMBER || await fetchBlooioNumber()

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:uP',
    'N:;uP;;;',
    'ORG:GrounduP',
    number ? `TEL;TYPE=CELL:${number}` : '',
    'URL:https://groundupapp.com',
    'NOTE:Your daily music career assistant — Spotify pitching\\, release planning\\, Meta ads.',
    PHOTO_B64 ? `PHOTO;ENCODING=b;TYPE=JPEG:${PHOTO_B64}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n')

  return {
    statusCode: 200,
    headers: {
      'Content-Type':        'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="uP.vcf"',
      'Cache-Control':       'public, max-age=3600',
    },
    body: vcard,
  }
}
