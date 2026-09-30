"use client"

import { memo } from "react"
import type { ComponentRendererProps } from "@/types/simulator"
import { PinHitArea } from "@/components/simulator/components/base/pin-hit-area"

function Ssd1306RendererInner({
  component,
  pins,
  selected,
  simulation,
  onPinClick,
  onPinPointerDown,
}: ComponentRendererProps) {
  const isPowered = simulation?.flags.powered === true
  const text = typeof component.metadata.text === "string" ? component.metadata.text : "AIoT Astra OLED\n128x64 Connected"
  const lines = text.split("\n")

  return (
    <g data-component-id={component.id}>
      {/* Blue PCB substrate */}
      <rect
        x={2}
        y={8}
        width={96}
        height={76}
        rx={5}
        fill="#1e3a8a"
        stroke={selected ? "var(--primary)" : "#172554"}
        strokeWidth={selected ? 2.5 : 1.5}
        filter="url(#sim-drop-shadow)"
      />
      {/* Corner mounting screw holes */}
      <circle cx={7} cy={13} r={2} fill="#0f172a" />
      <circle cx={93} cy={13} r={2} fill="#0f172a" />
      <circle cx={7} cy={79} r={2} fill="#0f172a" />
      <circle cx={93} cy={79} r={2} fill="#0f172a" />

      {/* OLED Glass panel */}
      <rect
        x={10}
        y={24}
        width={80}
        height={48}
        rx={2}
        fill="#050811"
        stroke="#334155"
        strokeWidth={1}
      />

      {/* OLED Screen Content when powered */}
      {isPowered ? (
        <g>
          {/* Subtle cyan pixel glow */}
          <rect
            x={11}
            y={25}
            width={78}
            height={46}
            fill="#0ea5e9"
            opacity={0.06}
          />
          {/* Header bar */}
          <rect x={12} y={26} width={76} height={9} fill="#0284c7" opacity={0.3} rx={1} />
          <text x={15} y={33} fill="#38bdf8" fontSize={6} fontWeight="bold" fontFamily="monospace">
            AIoT Astra I2C
          </text>
          <text x={84} y={33} fill="#38bdf8" fontSize={5.5} textAnchor="end" fontFamily="monospace">
            0x3C
          </text>

          {/* Body lines */}
          {lines.slice(0, 3).map((line, idx) => (
            <text
              key={idx}
              x={15}
              y={44 + idx * 9}
              fill="#e0f2fe"
              fontSize={6.5}
              fontFamily="monospace"
              style={{ filter: "drop-shadow(0 0 2px #38bdf8)" }}
            >
              {line}
            </text>
          ))}
        </g>
      ) : (
        <text x={50} y={50} fill="#334155" fontSize={6.5} textAnchor="middle" fontFamily="monospace">
          [STANDBY]
        </text>
      )}

      {/* Pin silkscreen labels */}
      <text x={26} y={19} fill="#bfdbfe" fontSize={5.5} fontWeight="bold" textAnchor="middle">GND</text>
      <text x={42} y={19} fill="#bfdbfe" fontSize={5.5} fontWeight="bold" textAnchor="middle">VCC</text>
      <text x={58} y={19} fill="#bfdbfe" fontSize={5.5} fontWeight="bold" textAnchor="middle">SCL</text>
      <text x={74} y={19} fill="#bfdbfe" fontSize={5.5} fontWeight="bold" textAnchor="middle">SDA</text>

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

export const Ssd1306Renderer = memo(Ssd1306RendererInner)
