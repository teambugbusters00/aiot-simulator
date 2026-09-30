"use client"

import { memo } from "react"
import type { ComponentRendererProps } from "@/types/simulator"
import { PinHitArea } from "@/components/simulator/components/base/pin-hit-area"

function PirMotionSensorRendererInner({
  component,
  pins,
  selected,
  simulation,
  onPinClick,
  onPinPointerDown,
}: ComponentRendererProps) {
  const isMotion = simulation?.flags.motionDetected === true || component.metadata.motionDetected === true

  return (
    <g data-component-id={component.id}>
      {/* Green PCB board base */}
      <rect
        x={2}
        y={2}
        width={76}
        height={66}
        rx={5}
        fill="#15803d"
        stroke={selected ? "var(--primary)" : "#166534"}
        strokeWidth={selected ? 2.5 : 1.5}
        filter="url(#sim-drop-shadow)"
      />
      {/* Corner mounting screw holes */}
      <circle cx={8} cy={8} r={2} fill="#14532d" />
      <circle cx={72} cy={8} r={2} fill="#14532d" />

      {/* White Fresnel Dome Lens */}
      <circle
        cx={40}
        cy={32}
        r={22}
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth={1}
        filter="url(#sim-drop-shadow-sm)"
      />
      {/* Faceted grid pattern on lens */}
      <circle cx={40} cy={32} r={16} fill="none" stroke="#e2e8f0" strokeWidth={0.8} />
      <circle cx={40} cy={32} r={9} fill="none" stroke="#cbd5e1" strokeWidth={0.8} />
      <line x1={18} y1={32} x2={62} y2={32} stroke="#cbd5e1" strokeWidth={0.8} />
      <line x1={40} y1={10} x2={40} y2={54} stroke="#cbd5e1" strokeWidth={0.8} />
      <line x1={24} y1={16} x2={56} y2={48} stroke="#e2e8f0" strokeWidth={0.7} />
      <line x1={24} y1={48} x2={56} y2={16} stroke="#e2e8f0" strokeWidth={0.7} />

      {/* Motion Active Glow Ring */}
      {isMotion && (
        <circle
          cx={40}
          cy={32}
          r={26}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.85}
        />
      )}

      {/* Status Alert LED */}
      <circle cx={14} cy={32} r={3} fill={isMotion ? "#ef4444" : "#4b5563"} stroke="#1f2937" strokeWidth={0.6} />

      {/* Pin silkscreen labels */}
      <text x={22} y={63} fill="#dcfce7" fontSize={6} fontWeight="bold" textAnchor="middle">VCC</text>
      <text x={40} y={63} fill="#dcfce7" fontSize={6} fontWeight="bold" textAnchor="middle">OUT</text>
      <text x={58} y={63} fill="#dcfce7" fontSize={6} fontWeight="bold" textAnchor="middle">GND</text>

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

export const PirMotionSensorRenderer = memo(PirMotionSensorRendererInner)
