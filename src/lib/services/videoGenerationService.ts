// ─────────────────────────────────────────────────────────────────────────────
// VIDEO GENERATION SERVICE
//
// PLUG IN ONE OF THESE (add to .env, redeploy — nothing else changes):
//
//   ① Runway ML  — recommended, best music video aesthetic
//      Sign up : https://runwayml.com
//      Docs    : https://docs.runwayml.com/docs/gen-3-alpha-turbo
//      Env var : VITE_RUNWAY_API_KEY=your_key_here
//
//   ② Kling AI  — competitive quality, often faster
//      Sign up : https://klingai.com
//      Docs    : https://docs.klingai.com/api-reference
//      Env var : VITE_KLING_API_KEY=your_key_here
//
// When none are set the service returns mock placeholder data so the UI
// works end-to-end immediately.
// ─────────────────────────────────────────────────────────────────────────────

import type { GenerateVideoParams, GeneratedVideo } from '../../types/videoGeneration.types';
import { supabase } from '../../lib/supabaseClient';

const RUNWAY_KEY = import.meta.env.VITE_RUNWAY_API_KEY || '';
const KLING_KEY  = import.meta.env.VITE_KLING_API_KEY  || '';

export const videoGenConfigured = !!(RUNWAY_KEY || KLING_KEY);

const DURATION_SECONDS: Record<string, number> = {
  '15s': 5,
  '30s': 10,
  '60s': 10,
  '90s': 10,
};

// ── Prompt builder ─────────────────────────────────────────────────────────
function buildPrompt(p: GenerateVideoParams): string {
  const conceptMap: Record<string, string> = {
    'Visualizer':           'abstract music visualizer, reactive to beat, flowing shapes',
    'Lyric Video':          'lyric video style, bold typography, dynamic text animation',
    'Teaser':               'short teaser clip, cinematic reveal, building anticipation',
    'Short Clip':           'short-form content, punchy, social media optimized',
    'Music Video Concept':  'music video concept, narrative driven, artistic direction',
  };
  const styleMap: Record<string, string> = {
    Minimal:    'minimal, clean, lots of white space, understated',
    Cinematic:  'cinematic, film grain, wide aspect ratio, dramatic lighting',
    Abstract:   'abstract, generative art, particle systems, fluid simulation',
    Colorful:   'vibrant colors, saturated palette, energetic, eye-catching',
    Dark:       'dark moody atmosphere, shadows, dramatic, gothic aesthetic',
    Neon:       'neon lights, cyberpunk aesthetic, electric glow, night scene',
  };

  return `${conceptMap[p.concept] || ''}, ${p.description}, ${styleMap[p.style] || ''}, professional music industry quality, 4K resolution`.trim();
}

// ── Mock fallback ──────────────────────────────────────────────────────────
const MOCK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop',
];

async function mockGenerate(): Promise<{ videoUrl: string | null; thumbnailUrl: string }> {
  await new Promise(r => setTimeout(r, 3000));
  return {
    videoUrl: null,
    thumbnailUrl: MOCK_THUMBNAILS[Math.floor(Math.random() * MOCK_THUMBNAILS.length)],
  };
}

// ── Runway ML adapter ──────────────────────────────────────────────────────
// Runway Gen-3 Alpha Turbo: text-to-video
// Returns a task ID; poll /tasks/{id} until status === "SUCCEEDED"
async function generateWithRunway(
  prompt: string,
  params: GenerateVideoParams
): Promise<{ videoUrl: string | null; thumbnailUrl: string | null }> {
  // Step 1: create task
  const createRes = await fetch('https://api.runwayml.com/v1/text_to_video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RUNWAY_KEY}`,
      'Content-Type': 'application/json',
      'X-Runway-Version': '2024-11-06',
    },
    body: JSON.stringify({
      promptText: prompt,
      model: 'gen3a_turbo',
      duration: DURATION_SECONDS[params.duration] ?? 10,
      ratio: '1280:768',
    }),
  });
  if (!createRes.ok) throw new Error(`Runway create error: ${createRes.status}`);
  const { id: taskId } = await createRes.json();

  // Step 2: poll until done (max 3 minutes)
  for (let i = 0; i < 36; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const pollRes = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${RUNWAY_KEY}`, 'X-Runway-Version': '2024-11-06' },
    });
    if (!pollRes.ok) continue;
    const task = await pollRes.json();
    if (task.status === 'SUCCEEDED') {
      return { videoUrl: task.output?.[0] ?? null, thumbnailUrl: null };
    }
    if (task.status === 'FAILED') throw new Error('Runway task failed');
  }
  throw new Error('Runway task timed out');
}

// ── Kling AI adapter ───────────────────────────────────────────────────────
async function generateWithKling(
  prompt: string,
  params: GenerateVideoParams
): Promise<{ videoUrl: string | null; thumbnailUrl: string | null }> {
  const createRes = await fetch('https://api.klingai.com/v1/videos/text2video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KLING_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model_name: 'kling-v1',
      duration: params.duration === '15s' ? '5' : '10',
      aspect_ratio: '16:9',
    }),
  });
  if (!createRes.ok) throw new Error(`Kling create error: ${createRes.status}`);
  const { data: { task_id } } = await createRes.json();

  for (let i = 0; i < 36; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const pollRes = await fetch(`https://api.klingai.com/v1/videos/text2video/${task_id}`, {
      headers: { 'Authorization': `Bearer ${KLING_KEY}` },
    });
    if (!pollRes.ok) continue;
    const { data } = await pollRes.json();
    if (data.task_status === 'succeed') {
      const work = data.task_result?.videos?.[0];
      return { videoUrl: work?.url ?? null, thumbnailUrl: work?.cover_image_url ?? null };
    }
    if (data.task_status === 'failed') throw new Error('Kling task failed');
  }
  throw new Error('Kling task timed out');
}

// ── Main export ────────────────────────────────────────────────────────────
export async function generateVideo(
  params: GenerateVideoParams,
  userId: string
): Promise<GeneratedVideo> {
  const prompt = buildPrompt(params);
  let videoUrl: string | null = null;
  let thumbnailUrl: string | null = null;

  if (RUNWAY_KEY) {
    ({ videoUrl, thumbnailUrl } = await generateWithRunway(prompt, params));
  } else if (KLING_KEY) {
    ({ videoUrl, thumbnailUrl } = await generateWithKling(prompt, params));
  } else {
    ({ videoUrl, thumbnailUrl } = await mockGenerate());
  }

  const row = {
    user_id:       userId,
    concept:       params.concept,
    style:         params.style,
    duration:      params.duration,
    description:   params.description,
    video_url:     videoUrl,
    thumbnail_url: thumbnailUrl,
    prompt_used:   prompt,
    status:        videoUrl ? 'complete' : 'pending',
  };

  const { data, error } = await supabase
    .from('generated_videos')
    .insert([row])
    .select()
    .single();

  if (error || !data) {
    return { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row } as GeneratedVideo;
  }

  return data as GeneratedVideo;
}

export async function fetchUserVideos(userId: string): Promise<GeneratedVideo[]> {
  const { data, error } = await supabase
    .from('generated_videos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as GeneratedVideo[];
}

export async function deleteVideo(id: string): Promise<void> {
  await supabase.from('generated_videos').delete().eq('id', id);
}
