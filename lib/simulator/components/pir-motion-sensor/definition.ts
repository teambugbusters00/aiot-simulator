import type { ComponentDefinition } from "@/types/simulator"
import { defaultCanConnectPins } from "@/lib/simulator/utils/pins"
import { simulatePirMotionSensor } from "@/lib/simulator/engine/component-simulation"
import { PirMotionSensorRenderer } from "@/components/simulator/components/pir-motion-sensor/renderer"

export const pirMotionSensorDefinition: ComponentDefinition = {
  type: "pir-motion-sensor",
  name: "PIR Motion Sensor",
  category: "input",
  width: 80,
  height: 72,
  pinTemplates: [
    { name: "VCC", type: "power", x: 22, y: 68 },
    { name: "OUT", type: "digital", x: 40, y: 68 },
    { name: "GND", type: "ground", x: 58, y: 68 },
  ],
  defaultMetadata: {
    motionDetected: false,
  },
  canConnectPins: defaultCanConnectPins,
  getInternalConnections: () => [],
  simulate: simulatePirMotionSensor,
  Renderer: PirMotionSensorRenderer,
}
