"use client"

// Global audio context for real-time synthesizer/buzzer sound effects
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

const activeOscillators = new Map<string, { osc: OscillatorNode; gain: GainNode }>()

export function setBuzzerSound(id: string, active: boolean, frequency: number = 2000) {
  if (typeof window === "undefined") return

  const ctx = getAudioContext()
  if (!ctx) return

  const current = activeOscillators.get(id)

  if (active && !current) {
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)

      // Safe, pleasant volume
      gain.gain.setValueAtTime(0.04, ctx.currentTime)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()

      activeOscillators.set(id, { osc, gain })
    } catch {
      // Audio context might be restricted before first click
    }
  } else if (!active && current) {
    try {
      current.gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.03)
      setTimeout(() => {
        try {
          current.osc.stop()
          current.osc.disconnect()
        } catch {}
      }, 35)
    } catch {}
    activeOscillators.delete(id)
  }
}

export function stopAllSounds() {
  for (const [id, item] of activeOscillators.entries()) {
    try {
      item.osc.stop()
      item.osc.disconnect()
    } catch {}
  }
  activeOscillators.clear()
}
