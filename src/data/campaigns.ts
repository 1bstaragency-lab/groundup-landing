export interface Campaign {
  artist:   string
  project:  string
  type:     string
  label:    string
  year:     string
  result?:  string // headline metric
}

// Real campaigns. Streaming + TikTok numbers pulled from live platform data.
// NOTE: artist + label fields are placeholders — fill in the real artist name
// and label for each track and they'll update on the funnel + /campaigns page.
export const CAMPAIGNS: Campaign[] = [
  { artist: 'slayr',                  project: 'Sloppy Joe',             type: 'Viral Sound Rollout', label: 'Add label', year: '2025', result: '10.6M streams · 99.3K TikToks' },
  { artist: 'Million Dollar Mansion', project: 'Single',                 type: 'TikTok Sound Push',   label: 'Add label', year: '2025', result: '2.87M streams · 12.3K TikToks' },
  { artist: '5love',                  project: "I'm Scared",             type: 'Viral Sound Rollout', label: 'Add label', year: '2025', result: '2.26M streams · 570.4K TikToks' },
  { artist: 'WIMPY KID',              project: 'Single',                 type: 'TikTok Sound Push',   label: 'Add label', year: '2025', result: '422K streams · 276K TikToks' },
]
