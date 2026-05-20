export interface Campaign {
  artist:   string
  project:  string
  type:     string
  label:    string
  year:     string
  result?:  string // headline metric — filler for now
}

// FILLER — replace with real campaigns + data when ready.
export const CAMPAIGNS: Campaign[] = [
  { artist: 'Artist Name', project: 'Project Title', type: 'Single Rollout', label: '10K Projects',          year: '2025', result: '+2.4M streams' },
  { artist: 'Artist Name', project: 'Project Title', type: 'EP Campaign',    label: 'Interscope Records',     year: '2025', result: '#1 editorial add' },
  { artist: 'Artist Name', project: 'Project Title', type: 'Album Rollout',  label: 'Geffen Records',         year: '2024', result: '+180K monthly listeners' },
  { artist: 'Artist Name', project: 'Project Title', type: 'Tour Promo',     label: 'Simple Stupid Records',  year: '2024', result: '12 dates sold out' },
  { artist: 'Artist Name', project: 'Project Title', type: 'Single Rollout', label: 'Atlantic Records',       year: '2024', result: '+5.1M TikTok views' },
  { artist: 'Artist Name', project: 'Project Title', type: 'Catalog Revive', label: 'Independent',            year: '2023', result: '3x stream lift' },
]
