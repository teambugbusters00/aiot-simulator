"use client"

import { memo, useCallback } from "react"
import type { PlacedComponent } from "@/types/simulator"
import { getComponentDefinition } from "@/lib/simulator/registry"
import { useSimulator } from "@/hooks/simulator/use-simulator-state"

interface PlacedComponentItemProps {
  component: PlacedComponent
  onPinClick: (componentId: string, pinId: string) => void
  onSelect: (id: string) => void
  onDragStart: (id: string, e: React.PointerEvent) => void
}

function PlacedComponentItemInner({
  component,
  onPinClick,
  onSelect,
  onDragStart,
}: PlacedComponentItemProps) {
  const { state, dispatch, getPinsForComponent, simulationResults } = useSimulator()
  const def = getComponentDefinition(component.type)
  if (!def) return null

  const pins = getPinsForComponent(component)
  const selected = state.selectedComponentId === component.id
  const simulation = simulationResults[component.id] ?? null
  const Renderer = def.Renderer

  const handlePinClick = useCallback(
    (pinId: string) => onPinClick(component.id, pinId),
    [component.id, onPinClick]
  )

  const handlePinPointerDown = useCallback(
    (pinId: string, e: React.PointerEvent) => {
      e.stopPropagation()
      if (!state.wireDraft && !state.rewireDraft) {
        onPinClick(component.id, pinId)
      }
    },
    [component.id, onPinClick, state.wireDraft, state.rewireDraft]
  )

  return (
    <g
      transform={`translate(${component.x}, ${component.y}) rotate(${component.rotation})`}
      data-component-id={component.id}
      filter={selected ? "url(#sim-selected-glow)" : undefined}
      className="origin-center animate-in fade-in zoom-in-95 duration-150"
      style={{ cursor: "grab" }}
      onClick={(e) => {
        if ((e.target as Element).closest("[data-pin-id]")) return
        e.stopPropagation()

        if (component.type === "push-button") {
          dispatch({
            type: "UPDATE_METADATA",
            id: component.id,
            metadata: { pressed: component.metadata.pressed !== true },
          })
        } else if (component.type === "slide-switch") {
          dispatch({
            type: "UPDATE_METADATA",
            id: component.id,
            metadata: { on: component.metadata.on !== true },
          })
        } else if (component.type === "tilt-switch") {
          dispatch({
            type: "UPDATE_METADATA",
            id: component.id,
            metadata: { tilted: component.metadata.tilted !== true },
          })
        } else if (component.type === "potentiometer") {
          const cur = typeof component.metadata.position === "number" ? component.metadata.position : 0.5
          const next = cur >= 0.95 ? 0.0 : Math.round((cur + 0.2) * 100) / 100
          dispatch({
            type: "UPDATE_METADATA",
            id: component.id,
            metadata: { position: next },
          })
        } else if (component.type === "photoresistor-sensor" || component.type === "photoresistor") {
          const cur = typeof component.metadata.lightLevel === "number" ? component.metadata.lightLevel : 0.5
          const next = cur > 0.5 ? 0.15 : 0.85
          dispatch({
            type: "UPDATE_METADATA",
            id: component.id,
            metadata: { lightLevel: next },
          })
        } else if (component.type === "pir-motion-sensor") {
          dispatch({
            type: "UPDATE_METADATA",
            id: component.id,
            metadata: { motionDetected: component.metadata.motionDetected !== true },
          })
        }
      }}
      onPointerDown={(e) => {
        if ((e.target as Element).closest("[data-pin-id]")) return
        e.stopPropagation()
        onSelect(component.id)
        onDragStart(component.id, e)
      }}
    >
      <Renderer
        component={component}
        pins={pins}
        selected={selected}
        simulation={simulation}
        onPinClick={handlePinClick}
        onPinPointerDown={handlePinPointerDown}
      />
    </g>
  )
}

export const PlacedComponentItem = memo(PlacedComponentItemInner)
