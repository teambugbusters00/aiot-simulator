"use client"

import { useState } from "react"
import {
  Sparkles,
  Bot,
  Cpu,
  Layers,
  Code2,
  ReceiptText,
  Play,
  Check,
  Copy,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSimulator } from "@/hooks/simulator/use-simulator-state"
import {
  translateBlueprintToSimulator,
  type RawCircuitBlueprint,
  type TranslatedCircuit,
} from "@/lib/simulator/ai/circuit-translator"

const QUICK_TEMPLATES = [
  {
    title: "🌦️ Smart Weather Station",
    prompt: "Connect an ESP32 to a DHT11 temperature/humidity sensor and an LCD1602 display",
    desc: "ESP32 + DHT11 + LCD1602 I2C",
  },
  {
    title: "🤖 Obstacle Detection Alarm",
    prompt: "Connect an ESP32 to an HC-SR04 ultrasonic distance sensor and a piezo buzzer for obstacle alerting",
    desc: "ESP32 + HC-SR04 + Buzzer",
  },
  {
    title: "🦾 Servo Positioner",
    prompt: "Connect an ESP32 to an SG90 micro servo motor and a rotary potentiometer",
    desc: "ESP32 + Servo + Potentiometer",
  },
  {
    title: "💡 Interactive Push Button LED",
    prompt: "Connect an Arduino Uno to an LED and a push button with current-limiting resistor",
    desc: "Arduino Uno + LED + Push Button",
  },
  {
    title: "⚡ Relay Load Controller",
    prompt: "Connect an ESP32 to a 5V relay module and an indicator LED",
    desc: "ESP32 + 5V Relay + LED",
  },
]

interface AICircuitModalProps {
  open: boolean
  onClose: () => void
  onOpenCodeEditor?: () => void
}

export function AICircuitModal({ open, onClose, onOpenCodeEditor }: AICircuitModalProps) {
  const { dispatch } = useSimulator()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "code" | "bom">("overview")
  const [copiedCode, setCopiedCode] = useState(false)
  const [result, setResult] = useState<TranslatedCircuit | null>(null)
  const [deployed, setDeployed] = useState(false)

  if (!open) return null

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = (customPrompt || prompt).trim()
    if (!textToRun) return

    setLoading(true)
    setError(null)
    setDeployed(false)
    setResult(null)

    try {
      const res = await fetch("/api/generate-circuit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToRun }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate circuit.")
      }

      const translated = translateBlueprintToSimulator(data as RawCircuitBlueprint)
      setResult(translated)
      setActiveTab("overview")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating circuit."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDeployToCanvas = () => {
    if (!result) return

    // 1. Load circuit into simulator canvas
    dispatch({
      type: "LOAD_STATE",
      state: {
        components: result.components,
        wires: result.wires,
      },
    })

    // 2. Persist Arduino C++ code for Code Editor
    if (result.arduinoCode && typeof window !== "undefined") {
      try {
        window.localStorage.setItem("aiot-simulator:sketch-draft", result.arduinoCode)
      } catch {
        // storage ignored
      }
    }

    setDeployed(true)
  }

  const handleCopyCode = async () => {
    if (!result?.arduinoCode) return
    try {
      await navigator.clipboard.writeText(result.arduinoCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // fallback
    }
  }

  const totalCost = result?.bom?.reduce((acc, item) => {
    const num = parseFloat(item.estimatedCost.replace(/[^0-9.]/g, ""))
    return acc + (isNaN(num) ? 0 : num * (item.quantity || 1))
  }, 0)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-3 py-6 backdrop-blur-md animate-in fade-in duration-200 sm:px-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl shadow-primary/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  AI Circuit Architect
                </h2>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  AIoT Astra
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Describe an IoT circuit in natural language — Gemini synthesizes the schematic, wiring, and code.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Circuit Requirement Prompt
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Connect an ESP32 to a DHT11 temperature sensor and a servo motor that turns when temperature rises..."
                rows={3}
                disabled={loading}
                className="w-full resize-none rounded-xl border border-border/80 bg-background/80 p-3 text-sm text-foreground shadow-inner placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Quick Template pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">Presets:</span>
              {QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => {
                    setPrompt(tmpl.prompt)
                    handleGenerate(tmpl.prompt)
                  }}
                  disabled={loading}
                  className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/[0.08] hover:text-foreground active:scale-95"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-muted-foreground">
              {loading && (
                <span className="flex items-center gap-2 text-primary font-medium animate-pulse">
                  <Loader2 className="size-3.5 animate-spin" />
                  Synthesizing schematic & firmware...
                </span>
              )}
            </div>
            <Button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20 hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate Circuit
                </>
              )}
            </Button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Failed</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-4 rounded-xl border border-border/80 bg-background/40 p-4">
              {/* Deploy Callout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/[0.07] p-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-foreground">
                      Circuit Blueprint Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {result.components.length} components · {result.wires.length} wires synthesized
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleDeployToCanvas}
                    className="gap-1.5 bg-primary text-primary-foreground shadow-sm"
                  >
                    {deployed ? (
                      <>
                        <Check className="size-3.5 text-emerald-300" />
                        Placed on Canvas!
                      </>
                    ) : (
                      <>
                        <Zap className="size-3.5" />
                        Build on Canvas
                      </>
                    )}
                  </Button>
                  {onOpenCodeEditor && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleDeployToCanvas()
                        onOpenCodeEditor()
                        onClose()
                      }}
                      className="gap-1.5"
                    >
                      <Code2 className="size-3.5" />
                      Open Code
                    </Button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 border-b border-border/60 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "overview"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Cpu className="size-3.5" />
                  Circuit Logic
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "code"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code2 className="size-3.5" />
                  Arduino C++
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("bom")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "bom"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ReceiptText className="size-3.5" />
                  Bill of Materials ({result.bom?.length || 0})
                </button>
              </div>

              {/* Tab: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-3 pt-1">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Engineering Logic & Explanation
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/90">
                      {result.explanation || result.logic}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Synthesized Components & Wiring
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {result.components.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2 text-xs"
                        >
                          <span className="flex size-5 items-center justify-center rounded bg-primary/15 font-mono text-[10px] font-bold text-primary">
                            {c.type.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1 truncate">
                            <p className="truncate font-medium text-foreground">{c.name || c.type}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{c.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Arduino Code */}
              {activeTab === "code" && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Compilable Firmware (Arduino C++)
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyCode}
                      className="h-7 gap-1 text-xs"
                    >
                      {copiedCode ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      {copiedCode ? "Copied" : "Copy Code"}
                    </Button>
                  </div>
                  <pre className="max-h-64 overflow-x-auto rounded-xl border border-border/60 bg-zinc-950 p-3 font-mono text-xs text-zinc-100">
                    <code>{result.arduinoCode}</code>
                  </pre>
                </div>
              )}

              {/* Tab: BOM */}
              {activeTab === "bom" && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Hardware Components Cost Estimate
                    </span>
                    {totalCost !== undefined && totalCost > 0 && (
                      <span className="text-xs font-bold text-emerald-500">
                        Total Est: ~${totalCost.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 font-semibold text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Component</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {result.bom?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-medium text-foreground">{item.name}</td>
                            <td className="px-3 py-2 text-center font-mono">{item.quantity}</td>
                            <td className="px-3 py-2 text-right font-mono text-emerald-600 dark:text-emerald-400">
                              {item.estimatedCost}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground text-[11px]">
                              {item.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/80 bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Bot className="size-3.5 text-primary" />
            <span>Powered by Gemini & AIoT Astra Hardware Knowledge Base</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
