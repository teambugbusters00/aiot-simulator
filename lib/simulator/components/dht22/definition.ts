import type { ComponentDefinition } from "@/types/simulator"
import { defaultCanConnectPins } from "@/lib/simulator/utils/pins"
import { simulateDht22 } from "@/lib/simulator/engine/component-simulation"
import { Dht22Renderer } from "@/components/simulator/components/dht22/renderer"

export const dht22Definition: ComponentDefinition = {
  type: "dht22",
  name: "DHT22 Sensor",
  category: "input",
  width: 60,
  height: 86,
  pinTemplates: [
    { name: "VCC", type: "power", x: 12, y: 84 },
    { name: "SDA", type: "digital", x: 24, y: 84 },
    { name: "NC", type: "passive", x: 36, y: 84 },
    { name: "GND", type: "ground", x: 48, y: 84 },
  ],
  defaultMetadata: {
    temperature: 25.4,
    humidity: 42.0,
  },
  canConnectPins: defaultCanConnectPins,
  getInternalConnections: () => [],
  simulate: simulateDht22,
  Renderer: Dht22Renderer,
}
