"use client"

import { memo } from "react"
import type { ComponentRendererProps } from "@/types/simulator"
import { PinHitArea } from "@/components/simulator/components/base/pin-hit-area"

function DcMotorRendererInner({
  component,
  pins,
  selected,
  simulation,
  onPinClick,
  onPinPointerDown,
}: ComponentRendererProps) {
  const isSpinning = simulation?.flags.isSpinning === true
  const speed = typeof simulation?.flags.speed === "number" ? simulation.flags.speed : 0.8
  const duration = isSpinning ? `${Math.max(0.12, 1.2 - speed * 0.9)}s` : "0s"

  return (
    <g data-component-id={component.id}>
      <style>{`
        @keyframes simMotorSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Main cylindrical motor can */}
      <circle
        cx={40}
        cy={40}
        r={32}
        fill="#2b3340"
        stroke={selected ? "var(--primary)" : "#1a202c"}
        strokeWidth={selected ? 2.5 : 1.5}
        filter="url(#sim-drop-shadow)"
      />
      <circle cx={40} cy={40} r={28} fill="#374151" stroke="#4b5563" strokeWidth={1} />
      <circle cx={40} cy={40} r={24} fill="#1f2937" />

      {/* Fan Blades Group */}
      <g
        style={{
          transformOrigin: "40px 40px",
          animation: isSpinning ? `simMotorSpin ${duration} linear infinite` : "none",
        }}
      >
        <circle cx={40} cy={40} r={6} fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
        {/* Blade 1 (Top) */}
        <path d="M 38 40 C 30 22, 22 12, 40 6 C 45 16, 42 34, 42 40 Z" fill="#38bdf8" opacity={0.88} stroke="#0284c7" strokeWidth={0.7} />
        {/* Blade 2 (Right) */}
        <path d="M 40 42 C 58 45, 68 55, 74 37 C 64 32, 46 38, 40 38 Z" fill="#38bdf8" opacity={0.88} stroke="#0284c7" strokeWidth={0.7} />
        {/* Blade 3 (Bottom) */}
        <path d="M 42 40 C 50 58, 58 68, 40 74 C 35 64, 38 46, 38 40 Z" fill="#38bdf8" opacity={0.88} stroke="#0284c7" strokeWidth={0.7} />
        {/* Blade 4 (Left) */}
        <path d="M 40 38 C 22 35, 12 25, 6 43 C 16 48, 34 42, 40 42 Z" fill="#38bdf8" opacity={0.88} stroke="#0284c7" strokeWidth={0.7} />
        <circle cx={40} cy={40} r={3} fill="#0f172a" />
      </g>

      {/* Terminal leads */}
      <line x1={22} y1={68} x2={22} y2={80} stroke="#ef4444" strokeWidth={2} />
      <line x1={58} y1={68} x2={58} y2={80} stroke="#3b82f6" strokeWidth={2} />

      <text x={22} y={64} fill="#ef4444" fontSize={7} fontWeight="bold" textAnchor="middle">+</text>
      <text x={58} y={64} fill="#3b82f6" fontSize={7} fontWeight="bold" textAnchor="middle">-</text>

      {pins.map((pin) => (
        <PinHitArea
          key={pin.id}
          pin={pin}
          componentId={component.id}
          onClick={() => onPinClick(pin.id)}
          onPointerDown={(e) => onPinPointerDown(pin.id, e)}
        />
      ))}
    </g>
  )
}

export const DcMotorRenderer = memo(DcMotorRendererInner)
