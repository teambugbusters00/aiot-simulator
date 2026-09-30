import type { ComponentDefinition } from "@/types/simulator"
import { defaultCanConnectPins } from "@/lib/simulator/utils/pins"
import { simulateSsd1306 } from "@/lib/simulator/engine/component-simulation"
import { Ssd1306Renderer } from "@/components/simulator/components/ssd1306/renderer"

export const ssd1306Definition: ComponentDefinition = {
  type: "ssd1306",
  name: "SSD1306 OLED (128x64)",
  category: "output",
  width: 100,
  height: 86,
  pinTemplates: [
    { name: "GND", type: "ground", x: 26, y: 8 },
    { name: "VCC", type: "power", x: 42, y: 8 },
    { name: "SCL", type: "digital", x: 58, y: 8 },
    { name: "SDA", type: "digital", x: 74, y: 8 },
  ],
  defaultMetadata: {
    text: "AIoT Astra OLED\nTelemetry Online\nStatus: OK",
  },
  canConnectPins: defaultCanConnectPins,
  getInternalConnections: () => [],
  simulate: simulateSsd1306,
  Renderer: Ssd1306Renderer,
}
