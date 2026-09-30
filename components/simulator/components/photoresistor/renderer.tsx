"use client"

import { memo } from "react"
import type { ComponentRendererProps } from "@/types/simulator"
import { PinHitArea } from "@/components/simulator/components/base/pin-hit-area"

function PhotoresistorRendererInner({
  component,
  pins,
  selected,
  simulation,
  onPinClick,
  onPinPointerDown,
}: ComponentRendererProps) {
  const lightLevel = typeof simulation?.flags.lightLevel === "number"
    ? simulation.flags.lightLevel
    : typeof component.metadata.lightLevel === "number"
      ? component.metadata.lightLevel
      : 0.5
  const isPowered = simulation?.flags.powered === true

  return (
    <g data-component-id={component.id}>
      {/* PCB Module Body */}
      <rect
        x={2}
        y={2}
        width={68}
        height={56}
        rx={5}
        fill="#1e3a5f"
        stroke={selected ? "var(--primary)" : "#0f233d"}
        strokeWidth={selected ? 2.5 : 1.5}
        filter="url(#sim-drop-shadow)"
      />
      {/* Corner mounting holes */}
      <circle cx={8} cy={8} r={2} fill="#0f233d" />
      <circle cx={62} cy={8} r={2} fill="#0f233d" />

      {/* Ceramic LDR Disc */}
      <circle cx={24} cy={26} r={14} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} />
      {/* Cadmium Sulfide serpentine track */}
      <path
        d="M 16 20 Q 24 16 32 20 Q 24 24 16 26 Q 24 30 32 30"
        fill="none"
        stroke="#ef4444"
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Ambient Light Sensor Glow */}
      <circle
        cx={24}
        cy={26}
        r={14}
        fill="#fef08a"
        opacity={lightLevel * 0.45}
        style={{ mixBlendMode: "screen", filter: "blur(2px)" }}
      />

      {/* Trimpot / Potentiometer on board */}
      <rect x={44} y={18} width={16} height={16} rx={2} fill="#2563eb" stroke="#1d4ed8" strokeWidth={1} />
      <circle cx={52} cy={26} r={4.5} fill="#f8fafc" stroke="#94a3b8" strokeWidth={0.8} />
      <line x1={50} y1={26} x2={54} y2={26} stroke="#475569" strokeWidth={1} />

      {/* Status LED */}
      <circle cx={52} cy={10} r={2} fill={isPowered ? "#22c55e" : "#475569"} />

      {/* Light Level Badge */}
      <text x={35} y={48} fill="#93c5fd" fontSize={6.5} fontWeight="bold" textAnchor="middle" fontFamily="monospace">
        LIGHT: {Math.round(lightLevel * 100)}%
      </text>

      {/* Pin headers */}
      <text x={12} y={55} fill="#94a3b8" fontSize={5.5} textAnchor="middle">VCC</text>
      <text x={26} y={55} fill="#94a3b8" fontSize={5.5} textAnchor="middle">GND</text>
      <text x={42} y={55} fill="#94a3b8" fontSize={5.5} textAnchor="middle">DO</text>
      <text x={56} y={55} fill="#94a3b8" fontSize={5.5} textAnchor="middle">AO</text>

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

export const PhotoresistorRenderer = memo(PhotoresistorRendererInner)
