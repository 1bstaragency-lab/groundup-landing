/**
 * Pull the audio track from a public YouTube link, for the "Match my
 * track to curators" flow — lets an artist paste a link instead of
 * needing the file on hand.
 *
 * Shells out to the yt-dlp binary (bundled by yt-dlp-exec) and grabs the
 * best audio-only stream as-is — no ffmpeg re-encode, since a bundled
 * ffmpeg binary would blow past what fits in a Netlify function zip.
 * Whatever container yt-dlp hands back (m4a/webm/opus) is returned
 * untouched. Capped to short clips + a filesize ceiling so the response
 * stays under Lambda's ~6MB synchronous payload limit — this is a
 * best-effort convenience, not a general-purpose downloader.
 *
 * POST body: { url: string }
 */
import type { Handler } from '@netlify/functions'
import { create } from 'yt-dlp-exec'
import { randomUUID } from 'node:crypto'
import { readFile, unlink, readdir } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const YOUTUBE_URL_RE = /^https?:\/\/(www\.|m\.|music\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]+/i

const MAX_DURATION_SECONDS = 6 * 60   // keeps the audio-only stream well under the payload cap
const MAX_FILESIZE         = '12M'    // yt-dlp's own ceiling on the format it picks

const MIME_BY_EXT: Record<string, string> = {
  m4a:  'audio/mp4',
  webm: 'audio/webm',
  opus: 'audio/ogg',
  ogg:  'audio/ogg',
  mp3:  'audio/mpeg',
}

const ytdlp = create(path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp'))

function json(statusCode: number, body: unknown) {
  return { statusCode, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { url?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return json(400, { ok: false, error: 'invalid_json', message: 'Invalid JSON' }) }

  const url = (body.url ?? '').trim()
  if (!YOUTUBE_URL_RE.test(url)) {
    return json(400, { ok: false, error: 'invalid_url', message: "That doesn't look like a YouTube link — paste a youtube.com or youtu.be URL." })
  }

  const id = randomUUID()
  const outTemplate = path.join(os.tmpdir(), `${id}.%(ext)s`)

  try {
    const info: any = await ytdlp(url, {
      output:        outTemplate,
      format:        `bestaudio[filesize<${MAX_FILESIZE}]/bestaudio`,
      maxFilesize:   MAX_FILESIZE,
      matchFilter:   `duration < ${MAX_DURATION_SECONDS}`,
      noPlaylist:    true,
      printJson:     true,
      noProgress:    true,
      quiet:         true,
      noWarnings:    true,
    })

    const dir = os.tmpdir()
    const match = (await readdir(dir)).find(f => f.startsWith(id))
    if (!match) {
      return json(502, { ok: false, error: 'download_failed', message: 'Could not download audio from that link.' })
    }

    const filePath = path.join(dir, match)
    const buf = await readFile(filePath)
    await unlink(filePath).catch(() => {})

    const ext = match.split('.').pop() ?? 'm4a'
    const title = (info?.title ?? 'track').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80)

    return json(200, {
      ok:          true,
      filename:    `${title}.${ext}`,
      mimeType:    MIME_BY_EXT[ext] ?? 'application/octet-stream',
      dataBase64:  buf.toString('base64'),
    })
  } catch (err: any) {
    console.error('[youtube-audio] fetch error:', err?.shortMessage || err?.message || err)
    const timedOut = /duration/i.test(err?.stderr ?? '') || /does not pass filter/i.test(err?.stderr ?? '')
    return json(timedOut ? 400 : 502, {
      ok:      false,
      error:   timedOut ? 'too_long' : 'fetch_failed',
      message: timedOut
        ? `That video is over ${MAX_DURATION_SECONDS / 60} minutes — paste a shorter clip.`
        : 'Could not fetch that video right now — try again in a minute.',
    })
  }
}
