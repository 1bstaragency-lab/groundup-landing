"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { Upload, Loader2, AtSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OnboardingFormProps {
  className?: string
  imageSrc?: string
  avatarSrc?: string
  avatarFallback: string
  title: string
  description: string
  inputPlaceholder?: string
  buttonText?: string
  onUploadClick?: () => void
  onSubmit: (username: string) => void
  isSubmitting?: boolean
}

const FADE_UP = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const } },
}

export const OnboardingForm = React.forwardRef<HTMLDivElement, OnboardingFormProps>(
  ({ className, imageSrc, avatarSrc, avatarFallback, title, description, inputPlaceholder = "artist name", buttonText = "Create Account", onUploadClick, onSubmit, isSubmitting = false }, ref) => {
    const [username, setUsername] = React.useState("")

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        className={cn("w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl", className)}
      >
        {imageSrc && (
          <motion.div variants={FADE_UP} className="relative h-36 overflow-hidden">
            <img src={imageSrc} alt="" className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/20 to-transparent" />
          </motion.div>
        )}

        <div className="space-y-6 p-8">
          <motion.div variants={FADE_UP} className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 px-3 py-1 mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]/70">GrounduP Artist OS</span>
            </div>
            <h1 className="font-black text-2xl text-white leading-tight">{title}</h1>
            <p className="text-white/50 text-sm">{description}</p>
          </motion.div>

          <motion.div variants={FADE_UP} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="border border-[#FFD700]/30">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="bg-zinc-800 text-[#FFD700] font-black text-xs">{avatarFallback}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm text-white">Profile photo</p>
                <p className="text-xs text-white/35">PNG or JPG up to 10MB</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onUploadClick}
              className="border-white/15 bg-transparent text-white/60 hover:border-[#FFD700]/40 hover:text-[#FFD700] rounded-xl text-xs">
              <Upload className="mr-1.5 h-3 w-3" />Upload
            </Button>
          </motion.div>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit(username) }} className="space-y-4">
            <motion.div variants={FADE_UP} className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                placeholder={inputPlaceholder}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-[#FFD700]/50 focus-visible:border-[#FFD700]/30 rounded-xl"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </motion.div>
            <motion.div variants={FADE_UP}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all disabled:opacity-50"
                style={{ background: isSubmitting ? 'rgba(255,215,0,0.5)' : '#FFD700', color: '#000' }}
              >
                {isSubmitting ? <><Loader2 className="inline mr-2 h-4 w-4 animate-spin" />Creating...</> : buttonText}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    )
  }
)
OnboardingForm.displayName = "OnboardingForm"
