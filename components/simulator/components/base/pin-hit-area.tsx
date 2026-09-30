"use client"

import { memo, useState } from "react"
import type { ComponentPin } from "@/types/simulator"
import { useViewportZoom } from "@/hooks/simulator/use-viewport-zoom"

interface PinHitAreaProps {
  pin: ComponentPin
  componentId: string
  onClick: () => void
  onPointerDown: (e: React.PointerEvent) => void
  radius?: number
}

// Screen-space touch target we aim for, in CSS px. Pins live inside the
// canvas's zoomed <g> transform, so a fixed world-unit radius shrinks to
// nothing once someone zooms out -- this compensates so a pin stays
// tappable at any zoom level, without inflating it into overlapping
// neighboring pins when zoomed in tight.
const TARGET_SCREEN_RADIUS = 16
const MAX_WORLD_RADIUS = 20

function PinHitAreaInner({
  pin,
  componentId,
  onClick,
  onPointerDown,
  radius = 7,
}: PinHitAreaProps) {
  const colorMap: Record<string, string> = {
    power: "#EF4444",
    ground: "#3B82F6",
    digital: "#F59E0B",
    analog: "#10B981",
    passive: "#A855F7",
  }
  const [hovered, setHovered] = useState(false)
  const color = colorMap[pin.type] ?? "#94A3B8"
  const zoom = useViewportZoom()
  const hitRadius = Math.min(MAX_WORLD_RADIUS, Math.max(radius, TARGET_SCREEN_RADIUS / zoom))

  return (
    <>
      {hitRadius > radius && (
        <circle
          cx={pin.x}
          cy={pin.y}
          r={hitRadius}
          fill="transparent"
          style={{ cursor: "crosshair", pointerEvents: "all" }}
          data-pin-id={pin.id}
          data-component-id={componentId}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          onPointerDown={(e) => {
            e.stopPropagation()
            setHovered(true)
            onPointerDown(e)
          }}
          onPointerUp={() => setHovered(false)}
        />
      )}
      <circle
        cx={pin.x}
        cy={pin.y}
        r={radius}
        fill={hovered ? color : "transparent"}
        fillOpacity={hovered ? 0.85 : 0}
        stroke={hovered ? color : "transparent"}
        strokeWidth={1.5}
        style={{
          cursor: "crosshair",
          pointerEvents: hitRadius > radius ? "none" : "all",
        }}
        data-pin-id={pin.id}
        data-component-id={componentId}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          setHovered(true)
          onPointerDown(e)
        }}
        onPointerUp={() => setHovered(false)}
      />
      {hovered && (
        <g pointerEvents="none" className="z-50 select-none">
          <circle
            cx={pin.x}
            cy={pin.y}
            r={radius + 4}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.9}
          />
          <rect
            x={pin.x - (pin.name.length * 3.5 + 6)}
            y={pin.y - 21}
            width={pin.name.length * 7 + 12}
            height={15}
            rx={3}
            fill="#090d16"
            stroke={color}
            strokeWidth={1}
            filter="url(#sim-drop-shadow-sm)"
          />
          <text
            x={pin.x}
            y={pin.y - 10}
            fill="#f8fafc"
            fontSize={8}
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {pin.name}
          </text>
        </g>
      )}
    </>
  )
}

export const PinHitArea = memo(PinHitAreaInner)
