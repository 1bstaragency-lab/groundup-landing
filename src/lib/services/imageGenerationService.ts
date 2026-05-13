// ─────────────────────────────────────────────────────────────────────────────
// IMAGE GENERATION SERVICE
//
// PLUG IN ONE OF THESE (add to .env, redeploy — nothing else changes):
//
//   ① fal.ai  — recommended, fastest, great for album art
//      Sign up : https://fal.ai
//      Docs    : https://fal.ai/models/fal-ai/flux/dev
//      Env var : VITE_FAL_API_KEY=your_key_here
//
//   ② OpenAI DALL·E 3  — highest quality, slowest
//      Sign up : https://platform.openai.com
//      Docs    : https://platform.openai.com/docs/api-reference/images
//      Env var : VITE_OPENAI_API_KEY=your_key_here
//
//   ③ Stability AI  — good quality, affordable
//      Sign up : https://platform.stability.ai
//      Docs    : https://platform.stability.ai/docs/api-reference
//      Env var : VITE_STABILITY_API_KEY=your_key_here
//
// When none are set the service returns mock placeholder images so the UI
// works end-to-end immediately.
// ─────────────────────────────────────────────────────────────────────────────

import type { GenerateImageParams, GeneratedImage } from '../../types/imageGeneration.types';
import { supabase } from '../../lib/supabaseClient';

const FAL_KEY       = import.meta.env.VITE_FAL_API_KEY       || '';
const OPENAI_KEY    = import.meta.env.VITE_OPENAI_API_KEY    || '';
const STABILITY_KEY = import.meta.env.VITE_STABILITY_API_KEY || '';

export const imageGenConfigured = !!(FAL_KEY || OPENAI_KEY || STABILITY_KEY);

// Map our UI aspect ratios to provider-specific size strings
const FAL_SIZES: Record<string, string> = {
  '1:1':  'square_hd',
  '16:9': 'landscape_16_9',
  '9:16': 'portrait_16_9',
  '3:4':  'portrait_4_3',
};
const DALLE_SIZES: Record<string, string> = {
  '1:1':  '1024x1024',
  '16:9': '1792x1024',
  '9:16': '1024x1792',
  '3:4':  '1024x1024', // closest DALL·E supports
};

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(p: GenerateImageParams): string {
  const moodMap: Record<string, string> = {
    Energetic:    'high energy, dynamic, bold colors, motion blur',
    Dark:         'moody, dark atmosphere, shadows, dramatic lighting',
    Vibrant:      'vibrant colors, saturated, lively, eye-catching',
    Minimal:      'minimalist, clean, simple, white space, understated',
    Cinematic:    'cinematic, film grain, widescreen, dramatic, epic',
    Psychedelic:  'psychedelic, surreal, kaleidoscopic, trippy, abstract',
  };
  const styleMap: Record<string, string> = {
    'Album Art':     'album cover art, music artwork, square format',
    'Social Post':   'social media post, Instagram-ready, engaging visual',
    'Thumbnail':     'YouTube thumbnail, high contrast, bold text space',
    'Promotional':   'promotional flyer, event poster, marketing material',
    'Release Cover': 'single/EP cover, streaming platform artwork',
  };

  return `${styleMap[p.style] || ''}, ${p.description}, ${moodMap[p.mood] || ''}, professional music industry quality, high resolution, no text`.trim();
}

// ── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop',
];

async function mockGenerate(): Promise<string> {
  await new Promise(r => setTimeout(r, 2000)); // simulate latency
  return MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
}

// ── fal.ai adapter ────────────────────────────────────────────────────────────
async function generateWithFal(prompt: string, aspectRatio: string): Promise<string> {
  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: FAL_SIZES[aspectRatio] || 'square_hd',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
    }),
  });
  if (!res.ok) throw new Error(`fal.ai error: ${res.status}`);
  const data = await res.json();
  return data.images?.[0]?.url ?? '';
}

// ── OpenAI DALL·E 3 adapter ───────────────────────────────────────────────────
async function generateWithDalle(prompt: string, aspectRatio: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: DALLE_SIZES[aspectRatio] || '1024x1024',
      quality: 'hd',
      n: 1,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.data?.[0]?.url ?? '';
}

// ── Stability AI adapter ──────────────────────────────────────────────────────
async function generateWithStability(prompt: string): Promise<string> {
  const res = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STABILITY_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      samples: 1,
      steps: 30,
    }),
  });
  if (!res.ok) throw new Error(`Stability error: ${res.status}`);
  const data = await res.json();
  const b64 = data.artifacts?.[0]?.base64;
  return b64 ? `data:image/png;base64,${b64}` : '';
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateImage(
  params: GenerateImageParams,
  userId: string
): Promise<GeneratedImage> {
  const prompt = buildPrompt(params);
  let imageUrl = '';

  if (FAL_KEY) {
    imageUrl = await generateWithFal(prompt, params.aspect_ratio);
  } else if (OPENAI_KEY) {
    imageUrl = await generateWithDalle(prompt, params.aspect_ratio);
  } else if (STABILITY_KEY) {
    imageUrl = await generateWithStability(prompt);
  } else {
    imageUrl = await mockGenerate();
  }

  const row = {
    user_id:     userId,
    description: params.description,
    style:       params.style,
    mood:        params.mood,
    aspect_ratio:params.aspect_ratio,
    image_url:   imageUrl,
    prompt_used: prompt,
  };

  const { data, error } = await supabase
    .from('generated_images')
    .insert([row])
    .select()
    .single();

  if (error || !data) {
    // Return without persisting if table doesn't exist yet
    return { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row } as GeneratedImage;
  }

  return data as GeneratedImage;
}

export async function fetchUserImages(userId: string): Promise<GeneratedImage[]> {
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as GeneratedImage[];
}

export async function deleteImage(id: string): Promise<void> {
  await supabase.from('generated_images').delete().eq('id', id);
}
