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
