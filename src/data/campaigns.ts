export interface Campaign {
  song:    string   // track title — the headline
  artist:  string   // performer — shown where the label used to be
  type:    string
  year:    string
  result?: string   // headline metric
}

// Real campaigns. Streaming + TikTok numbers pulled from live platform data.
export const CAMPAIGNS: Campaign[] = [
  { song: 'Sloppy Joe',             artist: 'slayr',         type: 'Viral Sound Rollout', year: '2025', result: '10.6M streams · 99.3K TikToks' },
  { song: 'Million Dollar Mansion', artist: 'Che',           type: 'TikTok Sound Push',   year: '2025', result: '2.87M streams · 12.3K TikToks' },
  { song: "I'm Scared",             artist: 'pradabagshawty', type: 'Viral Sound Rollout', year: '2025', result: '2.26M streams · 570.4K TikToks' },
  { song: 'WIMPY KID',              artist: 'Ealuhri',       type: 'TikTok Sound Push',   year: '2025', result: '422K streams · 276K TikToks' },
]
