"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, MessageCircle, Monitor, Loader2, Sparkles } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"
import { GOLD, GOLDD } from "../../lib/brand-tokens"
import { INK, DIM, FAINT, CARD } from "../../lib/dashboard-theme"

interface UpTask {
  id: string
  content: string
  source: 'app' | 'imessage'
  status: 'pending' | 'done'
  created_at: string
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function UpTasksFeed({ userId }: { userId: string }) {
  const [tasks, setTasks]     = useState<UpTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'pending' | 'done'>('pending')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('up_tasks')
      .select('id, content, source, status, created_at')
      .eq('user_id', userId)
      .eq('status', filter)
      .order('created_at', { ascending: false })
      .limit(20)
    setTasks((data as UpTask[]) ?? [])
    setLoading(false)
  }, [userId, filter])

  useEffect(() => { load() }, [load])

  async function toggleTask(task: UpTask) {
    const next = task.status === 'pending' ? 'done' : 'pending'
    await supabase.from('up_tasks').update({ status: next }).eq('id', task.id)
    setTasks(prev => prev.filter(t => t.id !== task.id))
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(184,134,11,0.3)' }}>
            <Sparkles size={10} style={{ color: GOLDD }} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(var(--dash-fg),0.56)' }}>uP Tasks</p>
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(var(--dash-fg),0.04)', border: `1px solid ${FAINT}` }}>
          {(['pending', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? 'gradient-button gradient-button-active px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all' : 'px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all dash-hover-text'}
              style={filter === f ? { color: '#fff' } : { color: DIM }}
            >
              {f === 'pending' ? 'To-Do' : 'Done'}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="animate-spin" style={{ color: GOLDD, opacity: 0.5 }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-6 text-center rounded-2xl" style={{ border: `1px dashed ${FAINT}` }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(255,215,0,0.1)' }}>
            <Sparkles size={14} style={{ color: GOLDD, opacity: 0.6 }} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(var(--dash-fg),0.52)' }}>
            {filter === 'pending' ? 'No tasks yet' : 'Nothing completed yet'}
          </p>
          <p className="text-[10px] font-medium mt-1" style={{ color: 'rgba(var(--dash-fg),0.45)' }}>
            {filter === 'pending' ? 'Chat with uP to generate action items' : 'Complete tasks to see them here'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -12, scale: 0.97 }}
              transition={{ delay: i * 0.04, duration: 0.22 }}
              className="flex items-start gap-3 p-3 rounded-2xl transition-colors group dash-hover-border"
              style={{ background: CARD, border: `1px solid ${FAINT}` }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task)}
                className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5"
                style={task.status === 'done' ? { background: GOLD, borderColor: GOLD } : { borderColor: 'rgba(var(--dash-fg),0.45)' }}
              >
                {task.status === 'done' && <Check size={9} strokeWidth={3} style={{ color: INK }} />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug" style={{ color: task.status === 'done' ? 'rgba(var(--dash-fg),0.56)' : DIM, textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                  {task.content}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {/* Source badge — kept gold-monochrome for consistency */}
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: GOLDD, background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.15)' }}>
                    {task.source === 'imessage'
                      ? <><MessageCircle size={8} /> iMessage</>
                      : <><Monitor size={8} /> App</>
                    }
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: 'rgba(var(--dash-fg),0.48)' }}>{timeAgo(task.created_at)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
