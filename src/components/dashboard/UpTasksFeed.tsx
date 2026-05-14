"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, MessageCircle, Monitor, Loader2, Sparkles } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

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
          <div className="w-5 h-5 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center">
            <Sparkles size={10} className="text-[#FFD700]" />
          </div>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">uP Tasks</p>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-zinc-900/60 rounded-lg border border-white/5">
          {(['pending', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-[#FFD700] text-black'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {f === 'pending' ? 'To-Do' : 'Done'}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="text-[#FFD700]/40 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-white/8 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto mb-2">
            <Sparkles size={14} className="text-[#FFD700]/40" />
          </div>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
            {filter === 'pending' ? 'No tasks yet' : 'Nothing completed yet'}
          </p>
          <p className="text-white/10 text-[10px] font-medium mt-1">
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
              className="flex items-start gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task)}
                className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                  task.status === 'done'
                    ? 'bg-[#FFD700] border-[#FFD700]'
                    : 'border-white/20 hover:border-[#FFD700]/60 group-hover:border-white/40'
                }`}
              >
                {task.status === 'done' && <Check size={9} strokeWidth={3} className="text-black" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${
                  task.status === 'done' ? 'text-white/25 line-through' : 'text-white/80'
                }`}>
                  {task.content}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {/* Source badge */}
                  <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    task.source === 'imessage'
                      ? 'text-green-400/70 border-green-500/15 bg-green-500/5'
                      : 'text-[#FFD700]/50 border-[#FFD700]/15 bg-[#FFD700]/5'
                  }`}>
                    {task.source === 'imessage'
                      ? <><MessageCircle size={8} /> iMessage</>
                      : <><Monitor size={8} /> App</>
                    }
                  </span>
                  <span className="text-white/15 text-[9px] font-bold">{timeAgo(task.created_at)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
