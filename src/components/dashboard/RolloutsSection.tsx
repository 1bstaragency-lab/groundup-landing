import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, Trash2, ChevronRight, CheckSquare, Square, X,
  Disc3, Layers, Music, ListMusic, Sparkles, Upload, ChevronLeft, Radio,
} from 'lucide-react';
import { BudgetCard } from '../ui/analytics-bento';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

type ReleaseType  = 'Single' | 'EP' | 'Album' | 'Mixtape' | 'SoundCloud Exclusive';
type BudgetLevel  = 'DIY / Low' | 'Moderate' | 'Full Push';
type FocusArea    = 'Streaming & Playlists' | 'Social Media & Virality' | 'Fan Community' | 'Visual Storytelling' | 'Press & Blogs' | 'Live & Touring';
type RolloutWeeks = 1 | 4 | 8 | 12;

interface ChecklistItem { id: string; label: string; done: boolean; category: string }
interface Release {
  id: string;
  title: string;
  type: ReleaseType;
  date: string;
  coverArt?: string;
  feature?: string;
  budget: BudgetLevel;
  focusAreas: FocusArea[];
  timeline: RolloutWeeks;
  checklist: ChecklistItem[];
}

interface WizardData {
  title: string;
  type: ReleaseType;
  date: string;
  coverArt?: string;
  feature: string;
  budget: BudgetLevel | '';
  focusAreas: FocusArea[];
  timeline: RolloutWeeks | 0;
}

const TYPE_META: Record<ReleaseType, { color: string; bg: string; border: string; icon: React.ReactNode; desc: string }> = {
  Single:  { color: 'text-[#FFD700]',  bg: 'bg-[#FFD700]/10',  border: 'border-[#FFD700]/20',  icon: <Disc3 size={26} />,    desc: 'One track. Perfect for testing a sound or building momentum.' },
  EP:      { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: <Layers size={26} />,   desc: '3–6 tracks. Introduce a sound without full album pressure.' },
  Album:   { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: <Music size={26} />,    desc: 'Your full statement. Plan the rollout months in advance.' },
  Mixtape: { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: <ListMusic size={26} />, desc: 'Raw, uncut. Rapid-fire community-first release.' },
  'SoundCloud Exclusive': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <Radio size={26} />, desc: 'SC-first drop. Build hype with the underground before DSPs.' },
};

const TYPE_COLORS: Record<ReleaseType, string> = {
  Single: 'bg-[#FFD700]/20 text-[#FFD700]',
  EP: 'bg-blue-500/20 text-blue-400',
  Album: 'bg-purple-500/20 text-purple-400',
  Mixtape: 'bg-green-500/20 text-green-400',
  'SoundCloud Exclusive': 'bg-orange-500/20 text-orange-400',
};

const FOCUS_AREAS: FocusArea[] = [
  'Streaming & Playlists', 'Social Media & Virality', 'Fan Community',
  'Visual Storytelling', 'Press & Blogs', 'Live & Touring',
];

const BUDGET_OPTIONS: { value: BudgetLevel; sub: string }[] = [
  { value: 'DIY / Low',  sub: 'Minimal spend, maximum hustle' },
  { value: 'Moderate',   sub: 'Some budget for quality production' },
  { value: 'Full Push',  sub: 'Ready to invest in a full campaign' },
];

const TIMELINE_OPTIONS: { value: RolloutWeeks; label: string; sub: string }[] = [
  { value: 1,  label: '1 Week',   sub: 'Soft release' },
  { value: 4,  label: '4 Weeks',  sub: 'Rush timeline' },
  { value: 8,  label: '8 Weeks',  sub: 'Standard timeline' },
  { value: 12, label: '12 Weeks', sub: 'Extended timeline' },
];

function uid() { return Math.random().toString(36).slice(2); }

function buildChecklist(data: WizardData): ChecklistItem[] {
  const items: { label: string; category: string }[] = [];

  // Core items always present
  items.push(
    { label: 'Finalize masters & get ISRC codes', category: 'Production' },
    { label: 'Upload cover art (3000×3000px)', category: 'Production' },
    { label: 'Submit to distributor', category: 'Distribution' },
  );

  if (data.timeline >= 8) {
    items.push({ label: 'Set up pre-save campaign', category: 'Distribution' });
  }

  if (data.focusAreas.includes('Streaming & Playlists')) {
    if (data.timeline >= 8) items.push({ label: 'Pitch to Spotify editorial (6+ weeks before release)', category: 'Streaming' });
    items.push({ label: 'Submit to SubmitHub / Groover', category: 'Streaming' });
    items.push({ label: 'Request Apple Music feature consideration', category: 'Streaming' });
  }

  if (data.focusAreas.includes('Social Media & Virality')) {
    items.push({ label: 'Plan TikTok rollout content series', category: 'Social' });
    items.push({ label: 'Create Instagram countdown story sequence', category: 'Social' });
    items.push({ label: 'Schedule announcement + release day posts', category: 'Social' });
    if (data.budget !== 'DIY / Low') {
      items.push({ label: 'Run paid social ads on release week', category: 'Social' });
    }
  }

  if (data.focusAreas.includes('Fan Community')) {
    items.push({ label: 'Send newsletter / email blast to fans', category: 'Community' });
    items.push({ label: 'Host listening party or live reveal', category: 'Community' });
    items.push({ label: 'Share behind-the-scenes content with superfans', category: 'Community' });
  }

  if (data.focusAreas.includes('Visual Storytelling')) {
    items.push({ label: 'Shoot music video or visualizer', category: 'Visual' });
    items.push({ label: 'Design animated lyric / cover art', category: 'Visual' });
    if (data.budget !== 'DIY / Low') {
      items.push({ label: 'Build full press kit with hi-res photos', category: 'Visual' });
    }
  }

  if (data.focusAreas.includes('Press & Blogs')) {
    if (data.timeline >= 8) items.push({ label: 'Send press release to blogs (4 weeks out)', category: 'Press' });
    items.push({ label: 'Submit to music review sites', category: 'Press' });
    items.push({ label: 'Pitch interview opportunities', category: 'Press' });
  }

  if (data.focusAreas.includes('Live & Touring')) {
    items.push({ label: 'Book release show or listening event', category: 'Live' });
    items.push({ label: 'Confirm setlist', category: 'Live' });
    items.push({ label: 'Promote show across social and email', category: 'Live' });
  }

  return items.map(i => ({ ...i, id: uid(), done: false }));
}

// ── Wizard ────────────────────────────────────────────────────────────────────

function AiMessage({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/30 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={13} className="text-[#FFD700]" />
      </div>
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-white/80 leading-relaxed font-medium max-w-md">
        {text}
      </div>
    </div>
  );
}

interface WizardProps {
  artistName: string;
  initialType?: ReleaseType;
  onClose: () => void;
  onCreate: (release: Release) => void;
}

const WIZARD_DRAFT_KEY = 'gup_rollout_draft_v1';

function NewRolloutWizard({ artistName, initialType, onClose, onCreate }: WizardProps) {
  // Restore any in-progress draft so swiping away (component unmount) doesn't
  // wipe what the user was filling out.
  const restored: (Partial<WizardData> & { step?: number }) | null = (() => {
    try {
      const raw = sessionStorage.getItem(WIZARD_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const [step, setStep] = useState<number>(restored?.step ?? 0);
  const [data, setData] = useState<WizardData>({
    title:      restored?.title ?? '',
    type:       restored?.type ?? initialType ?? 'Single',
    date:       restored?.date ?? '',
    coverArt:   restored?.coverArt,
    feature:    restored?.feature ?? '',
    budget:     restored?.budget ?? '',
    focusAreas: restored?.focusAreas ?? [],
    timeline:   restored?.timeline ?? 0,
  });

  // Persist the draft on every change so it survives navigation away & back.
  useEffect(() => {
    try {
      sessionStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify({ ...data, step }));
    } catch { /* quota / private mode — non-fatal */ }
  }, [data, step]);

  function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setData(prev => ({ ...prev, coverArt: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function toggleFocus(area: FocusArea) {
    setData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(f => f !== area)
        : [...prev.focusAreas, area],
    }));
  }

  function canNext() {
    if (step === 0) return !!data.title.trim() && !!data.date;
    if (step === 1) return !!data.budget && data.focusAreas.length > 0 && !!data.timeline;
    return true;
  }

  function clearDraft() {
    try { sessionStorage.removeItem(WIZARD_DRAFT_KEY); } catch { /* noop */ }
  }

  function finish() {
    const checklist = buildChecklist(data);
    const release: Release = {
      id: uid(),
      title: data.title,
      type: data.type,
      date: data.date,
      coverArt: data.coverArt,
      budget: data.budget as BudgetLevel,
      focusAreas: data.focusAreas,
      timeline: data.timeline as RolloutWeeks,
      checklist,
    };
    clearDraft();
    onCreate(release);
  }

  const aiMessages = [
    `Hey ${artistName}! Let's plan your next release. What are we working on?`,
    `Nice! "${data.title || 'this release'}" is coming together. Let's build the game plan — what's the budget and where do you want to focus?`,
    `Your rollout plan for "${data.title}" is ready. ${buildChecklist(data).length} tasks auto-generated based on your strategy — customize and crush it.`,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        className="bg-zinc-950 border border-white/8 rounded-3xl w-full max-w-xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="text-white/30 hover:text-white transition-colors mr-1">
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="text-white font-black text-lg uppercase tracking-tighter leading-none">
                {step === 0 ? 'New Rollout' : step === 1 ? `Setting Up "${data.title}"` : `Rollout Plan — "${data.title}"`}
              </h3>
              <p className="text-white/25 text-[10px] font-bold mt-0.5">
                {['Tell us about your release', 'Set your goals & strategy', 'Your custom checklist'][step]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Step pills */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-[#FFD700]' : i < step ? 'w-2 bg-[#FFD700]/50' : 'w-2 bg-white/10'}`}
                />
              ))}
            </div>
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AiMessage text={aiMessages[step]} />

              {/* ── Step 0: Release Info ── */}
              {step === 0 && (
                <div className="space-y-4">
                  {/* Cover art + basic fields */}
                  <div className="flex gap-4">
                    <label className="relative w-24 h-24 rounded-2xl border border-dashed border-white/15 bg-zinc-900/40 flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-colors shrink-0 overflow-hidden group">
                      {data.coverArt ? (
                        <img src={data.coverArt} alt="cover" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload size={18} className="text-white/20 group-hover:text-white/40 transition-colors mb-1" />
                          <span className="text-[9px] text-white/20 font-bold text-center leading-tight">Cover Art</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleCover} className="hidden" />
                    </label>

                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Title (e.g. Summer Nights)"
                        value={data.title}
                        onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-zinc-900/60 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Feature / Collaborator (optional)"
                        value={data.feature}
                        onChange={e => setData(prev => ({ ...prev, feature: e.target.value }))}
                        className="w-full bg-zinc-900/60 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Type</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(['Single', 'EP', 'Album', 'Mixtape', 'SoundCloud Exclusive'] as ReleaseType[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setData(prev => ({ ...prev, type: t }))}
                          className={`py-2.5 px-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all text-center leading-tight ${
                            data.type === t ? 'bg-[#FFD700] border-transparent text-black' : 'bg-zinc-900/60 border-white/8 text-white/40 hover:text-white'
                          }`}
                        >
                          {t === 'SoundCloud Exclusive' ? 'SoundCloud' : t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Release Date</p>
                    <input
                      type="date"
                      value={data.date}
                      onChange={e => setData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-zinc-900/60 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/30 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* ── Step 1: Strategy ── */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Budget */}
                  <div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Budget</p>
                    <div className="grid grid-cols-3 gap-2">
                      {BUDGET_OPTIONS.map(({ value, sub }) => (
                        <button
                          key={value}
                          onClick={() => setData(prev => ({ ...prev, budget: value }))}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            data.budget === value
                              ? 'bg-[#FFD700] border-transparent'
                              : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900 hover:border-white/10'
                          }`}
                        >
                          <p className={`font-black text-[10px] uppercase tracking-wide leading-none mb-1 ${data.budget === value ? 'text-black' : 'text-white/70'}`}>
                            {value}
                          </p>
                          <p className={`text-[9px] font-medium ${data.budget === value ? 'text-black/60' : 'text-white/20'}`}>
                            {sub}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Focus areas */}
                  <div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">
                      Focus Areas <span className="normal-case font-normal text-white/20">(select all that apply)</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {FOCUS_AREAS.map(area => (
                        <button
                          key={area}
                          onClick={() => toggleFocus(area)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border transition-all ${
                            data.focusAreas.includes(area)
                              ? 'bg-[#FFD700] border-transparent text-black'
                              : 'bg-zinc-900/40 border-white/8 text-white/40 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Timeline</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TIMELINE_OPTIONS.map(({ value, label, sub }) => (
                        <button
                          key={value}
                          onClick={() => setData(prev => ({ ...prev, timeline: value }))}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            data.timeline === value
                              ? 'bg-[#FFD700] border-transparent'
                              : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900 hover:border-white/10'
                          }`}
                        >
                          <p className={`font-black text-[10px] uppercase tracking-wide leading-none mb-1 ${data.timeline === value ? 'text-black' : 'text-white/70'}`}>
                            {label}
                          </p>
                          <p className={`text-[9px] font-medium ${data.timeline === value ? 'text-black/60' : 'text-white/20'}`}>
                            {sub}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Preview checklist ── */}
              {step === 2 && (
                <div className="space-y-2">
                  {buildChecklist(data).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-white/5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]/60 shrink-0" />
                      <p className="text-white/70 text-sm font-medium">{item.label}</p>
                      <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-white/20 shrink-0">
                        {item.category}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 pt-5 border-t border-white/5 shrink-0">
          {step < 2 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={finish}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-colors shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
            >
              <Sparkles size={14} />
              Launch Rollout
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────

export function RolloutsSection() {
  const { profile, user } = useAuth();
  const artistName = profile?.artist_name ?? user?.artistName ?? 'Artist';

  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardInitialType, setWizardInitialType] = useState<ReleaseType | undefined>();
  const [selected, setSelected] = useState<string | null>(null);

  const loadReleases = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('user_id', user.id)
        .order('release_date', { ascending: true });
      if (error) throw error;
      if (data) {
        setReleases((data as any[]).map(r => ({
          id: r.id,
          title: r.title,
          type: r.type as ReleaseType,
          date: r.release_date,
          coverArt: r.cover_art ?? undefined,
          feature: r.feature ?? '',
          budget: r.budget as BudgetLevel,
          focusAreas: r.focus_areas as FocusArea[],
          timeline: r.timeline as RolloutWeeks,
          checklist: r.checklist as ChecklistItem[],
        })));
      }
    } catch (err: any) {
      setLoadError(err?.message ?? 'Failed to load releases. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadReleases(); }, [loadReleases]);

  function openWizard(type?: ReleaseType) {
    setWizardInitialType(type);
    setShowWizard(true);
  }

  async function handleCreate(release: Release) {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('releases')
        .insert({
          user_id: user.id,
          title: release.title,
          type: release.type,
          release_date: release.date,
          cover_art: release.coverArt ?? null,
          feature: release.feature ?? null,
          budget: release.budget,
          focus_areas: release.focusAreas,
          timeline: release.timeline,
          checklist: release.checklist,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        const saved: Release = { ...release, id: (data as any).id };
        setReleases(prev => [...prev, saved].sort((a, b) => a.date.localeCompare(b.date)));
        setSelected(saved.id);
      }
    } catch (err: any) {
      setLoadError(err?.message ?? 'Failed to save release. Please try again.');
    } finally {
      setShowWizard(false);
    }
  }

  async function toggleCheck(releaseId: string, itemId: string) {
    const release = releases.find(r => r.id === releaseId);
    if (!release) return;
    const updated = release.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c);
    setReleases(prev => prev.map(r => r.id === releaseId ? { ...r, checklist: updated } : r));
    await supabase.from('releases').update({ checklist: updated }).eq('id', releaseId);
  }

  async function deleteRelease(id: string) {
    await supabase.from('releases').delete().eq('id', id);
    setReleases(prev => prev.filter(r => r.id !== id));
    if (selected === id) setSelected(null);
  }

  const activeRelease = releases.find(r => r.id === selected);
  const completedCount = activeRelease?.checklist.filter(c => c.done).length ?? 0;
  const totalCount = activeRelease?.checklist.length ?? 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
      <p className="text-white/30 text-[11px] font-black uppercase tracking-widest">Loading releases…</p>
    </div>
  );

  if (loadError) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <p className="text-red-400 font-black text-sm uppercase tracking-widest">Failed to load</p>
      <p className="text-white/30 text-xs max-w-sm">{loadError}</p>
      <button
        onClick={loadReleases}
        className="mt-2 px-5 py-2 rounded-xl bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-transform"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">Releases</h1>
          <p className="text-white/30 text-sm font-bold">
            {releases.length === 0 ? 'No releases planned yet.' : `${releases.length} release${releases.length > 1 ? 's' : ''} in pipeline`}
          </p>
        </div>
        <button
          onClick={() => openWizard()}
          className="flex items-center gap-3 px-6 py-3 bg-[#FFD700] text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
        >
          <Plus size={16} /> New Rollout
        </button>
      </div>

      {/* Wizard */}
      <AnimatePresence>
        {showWizard && (
          <NewRolloutWizard
            artistName={artistName}
            initialType={wizardInitialType}
            onClose={() => setShowWizard(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>

      {/* Empty state — type cards */}
      {releases.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">What are you releasing?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(TYPE_META) as ReleaseType[]).map(type => {
              const meta = TYPE_META[type];
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openWizard(type)}
                  className={`group flex flex-col items-start p-7 rounded-3xl border ${meta.bg} ${meta.border} hover:shadow-[0_0_40px_rgba(0,0,0,0.4)] transition-all duration-300 text-left`}
                >
                  <div className={`mb-4 ${meta.color}`}>{meta.icon}</div>
                  <p className={`font-black text-xl uppercase tracking-tighter mb-2 ${meta.color}`}>{type}</p>
                  <p className="text-white/30 text-[11px] font-medium leading-relaxed mb-5">{meta.desc}</p>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${meta.color} group-hover:translate-x-1 transition-transform`}>
                    Plan {type} <ChevronRight size={12} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Releases list + checklist panel */}
      {releases.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Release list */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Pipeline</p>
            {releases.map(r => (
              <motion.button
                key={r.id}
                layout
                onClick={() => setSelected(r.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group ${
                  selected === r.id
                    ? 'bg-zinc-900 border-[#FFD700]/40 shadow-[0_0_30px_rgba(255,215,0,0.08)]'
                    : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${TYPE_COLORS[r.type]}`}>{r.type}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteRelease(r.id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  {r.coverArt && (
                    <img src={r.coverArt} alt="cover" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  )}
                  <p className="text-white font-black text-sm uppercase tracking-tight">{r.title}</p>
                </div>
                <div className="flex items-center gap-2 text-white/30 mb-3">
                  <Calendar size={10} />
                  <span className="text-[10px] font-bold">
                    {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-white/10">·</span>
                  <span className="text-[10px] font-bold">{r.timeline}wk plan</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFD700] transition-all duration-500"
                    style={{ width: `${(r.checklist.filter(c => c.done).length / r.checklist.length) * 100}%` }}
                  />
                </div>
              </motion.button>
            ))}

            <button
              onClick={() => openWizard()}
              className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus size={12} /> Add Another
            </button>
          </div>

          {/* Checklist panel */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeRelease ? (
                <motion.div
                  key={activeRelease.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8"
                >
                  {/* Release header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      {activeRelease.coverArt && (
                        <img src={activeRelease.coverArt} alt="cover" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                      )}
                      <div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block mb-2 ${TYPE_COLORS[activeRelease.type]}`}>
                          {activeRelease.type}
                        </span>
                        <h3 className="text-white font-black text-2xl uppercase tracking-tighter">{activeRelease.title}</h3>
                        <p className="text-white/30 text-xs font-bold mt-1 flex items-center gap-2">
                          <Calendar size={10} />
                          {new Date(activeRelease.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#FFD700] font-black text-3xl">{Math.round(progress)}%</p>
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">{completedCount}/{totalCount} done</p>
                    </div>
                  </div>

                  {/* Focus area tags */}
                  {activeRelease.focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {activeRelease.focusAreas.map(area => (
                        <span key={area} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 text-white/30">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-8">
                    <motion.div
                      className="h-full bg-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Grouped checklist */}
                  <div className="space-y-3">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Rollout Checklist</p>
                    {activeRelease.checklist.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(activeRelease.id, item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left group ${
                          item.done
                            ? 'bg-[#FFD700]/10 border-[#FFD700]/20'
                            : 'bg-zinc-900/40 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {item.done
                          ? <CheckSquare size={16} className="text-[#FFD700] shrink-0" />
                          : <Square size={16} className="text-white/20 group-hover:text-white/40 shrink-0 transition-colors" />
                        }
                        <span className={`font-bold text-sm flex-1 text-left ${item.done ? 'text-white/30 line-through' : 'text-white/80'}`}>
                          {item.label}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/15 shrink-0">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Budget tracker — only shown when release has a budget set */}
                  {activeRelease.budget && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-8 pt-6 border-t border-white/5"
                    >
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                        Release Tracker · {activeRelease.budget}
                      </p>
                      <BudgetCard />
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full py-24 text-center"
                >
                  <p className="text-white/20 font-black text-sm uppercase tracking-widest">Select a release to view checklist</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
