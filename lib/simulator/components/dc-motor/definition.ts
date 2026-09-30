import type { ComponentDefinition } from "@/types/simulator"
import { defaultCanConnectPins } from "@/lib/simulator/utils/pins"
import { simulateDcMotor } from "@/lib/simulator/engine/component-simulation"
import { DcMotorRenderer } from "@/components/simulator/components/dc-motor/renderer"

export const dcMotorDefinition: ComponentDefinition = {
  type: "dc-motor",
  name: "DC Motor",
  category: "output",
  width: 80,
  height: 85,
  pinTemplates: [
    { name: "+", type: "power", x: 22, y: 80 },
    { name: "-", type: "ground", x: 58, y: 80 },
  ],
  defaultMetadata: {
    nominalVoltage: 5,
    speed: 0,
  },
  canConnectPins: defaultCanConnectPins,
  getInternalConnections: () => [],
  simulate: simulateDcMotor,
  Renderer: DcMotorRenderer,
}
