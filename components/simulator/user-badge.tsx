"use client"

import { Cpu, Sparkles } from "lucide-react"

export function UserBadge() {
  return (
    <div
      className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-background/60 px-2.5 py-1 text-xs shadow-sm backdrop-blur-sm sm:flex"
      title="AIoT Astra Studio — Gemini Hardware Engine Active"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
      </span>
      <span className="font-semibold text-foreground tracking-tight">AIoT Astra</span>
      <span className="text-[10px] text-muted-foreground font-mono">v1.0</span>
    </div>
  )
}
