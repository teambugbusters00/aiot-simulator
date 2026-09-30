import type { ComponentDefinition } from "@/types/simulator"
import { defaultCanConnectPins } from "@/lib/simulator/utils/pins"
import { simulatePhotoresistor } from "@/lib/simulator/engine/component-simulation"
import { PhotoresistorRenderer } from "@/components/simulator/components/photoresistor/renderer"

export const photoresistorDefinition: ComponentDefinition = {
  type: "photoresistor",
  name: "Photoresistor / LDR",
  category: "input",
  width: 72,
  height: 64,
  pinTemplates: [
    { name: "VCC", type: "power", x: 12, y: 60 },
    { name: "GND", type: "ground", x: 26, y: 60 },
    { name: "DO", type: "digital", x: 42, y: 60 },
    { name: "AO", type: "analog", x: 56, y: 60 },
  ],
  defaultMetadata: {
    lightLevel: 0.5,
  },
  canConnectPins: defaultCanConnectPins,
  getInternalConnections: () => [],
  simulate: simulatePhotoresistor,
  Renderer: PhotoresistorRenderer,
}
