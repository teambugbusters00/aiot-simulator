"use client"

import { memo } from "react"
import type { ComponentRendererProps } from "@/types/simulator"
import { PinHitArea } from "@/components/simulator/components/base/pin-hit-area"

function Dht22RendererInner({
  component,
  pins,
  selected,
  simulation,
  onPinClick,
  onPinPointerDown,
}: ComponentRendererProps) {
  const isPowered = simulation?.flags.powered === true
  const temp = typeof simulation?.flags.temperature === "number"
    ? simulation.flags.temperature
    : typeof component.metadata.temperature === "number"
      ? component.metadata.temperature
      : 25.4
  const hum = typeof simulation?.flags.humidity === "number"
    ? simulation.flags.humidity
    : typeof component.metadata.humidity === "number"
      ? component.metadata.humidity
      : 42.0

  return (
    <g data-component-id={component.id}>
      {/* 4 Metal Leads */}
      <line x1={12} y1={60} x2={12} y2={84} stroke="#94a3b8" strokeWidth={2} />
      <line x1={24} y1={60} x2={24} y2={84} stroke="#94a3b8" strokeWidth={2} />
      <line x1={36} y1={60} x2={36} y2={84} stroke="#94a3b8" strokeWidth={2} />
      <line x1={48} y1={60} x2={48} y2={84} stroke="#94a3b8" strokeWidth={2} />

      {/* Main White Sensor Body */}
      <rect
        x={3}
        y={4}
        width={54}
        height={58}
        rx={5}
        fill="#f8fafc"
        stroke={selected ? "var(--primary)" : "#cbd5e1"}
        strokeWidth={selected ? 2.5 : 1.5}
        filter="url(#sim-drop-shadow)"
      />

      {/* Ventilation Grid Slots */}
      {[14, 20, 26, 32].map((y) => (
        <rect key={y} x={12} y={y} width={36} height={3} rx={1} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.5} />
      ))}

      {/* Product Silkscreen label */}
      <text x={30} y={42} fill="#64748b" fontSize={7} fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
        DHT22 / AM2302
      </text>

      {/* Live Readout Badge */}
      <rect x={8} y={46} width={44} height={12} rx={2} fill={isPowered ? "#0f172a" : "#f1f5f9"} />
      <text x={30} y={54} fill={isPowered ? "#38bdf8" : "#94a3b8"} fontSize={6} fontWeight="bold" textAnchor="middle" fontFamily="monospace">
        {temp.toFixed(1)}°C | {hum.toFixed(0)}%
      </text>

      {/* Silkscreen Pin names */}
      <text x={12} y={70} fill="#64748b" fontSize={5} textAnchor="middle">VCC</text>
      <text x={24} y={70} fill="#64748b" fontSize={5} textAnchor="middle">SDA</text>
      <text x={36} y={70} fill="#64748b" fontSize={5} textAnchor="middle">NC</text>
      <text x={48} y={70} fill="#64748b" fontSize={5} textAnchor="middle">GND</text>

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

export const Dht22Renderer = memo(Dht22RendererInner)
