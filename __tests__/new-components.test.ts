import { describe, it, expect } from "vitest"
import { getComponentDefinition } from "@/lib/simulator/registry"
import {
  simulateDcMotor,
  simulatePhotoresistor,
  simulatePirMotionSensor,
  simulateSsd1306,
  simulateDht22,
} from "@/lib/simulator/engine/component-simulation"
import { canConnectPins } from "@/lib/simulator/engine/simulation-engine"
import { instantiatePins } from "@/lib/simulator/utils/pins"

describe("New Component Simulations & Wiring", () => {
  it("resolves definitions for all 5 new components and aliases", () => {
    expect(getComponentDefinition("dc-motor")).toBeDefined()
    expect(getComponentDefinition("motor")).toBeDefined()
    expect(getComponentDefinition("photoresistor")).toBeDefined()
    expect(getComponentDefinition("ldr")).toBeDefined()
    expect(getComponentDefinition("pir-motion-sensor")).toBeDefined()
    expect(getComponentDefinition("ssd1306")).toBeDefined()
    expect(getComponentDefinition("dht22")).toBeDefined()
  })

  it("simulates DC motor spinning when voltage is applied across terminals", () => {
    const def = getComponentDefinition("dc-motor")!
    const pins = instantiatePins("motor1", def.pinTemplates)
    const pinPos = pins.find((p) => p.name === "+")!
    const pinNeg = pins.find((p) => p.name === "-")!

    // Powered
    const resPowered = simulateDcMotor(
      { id: "motor1", type: "dc-motor", name: "DC Motor", x: 0, y: 0, rotation: 0, metadata: {} },
      pins,
      { [pinPos.id]: 5, [pinNeg.id]: 0 }
    )
    expect(resPowered.flags.isSpinning).toBe(true)
    expect(resPowered.flags.speed).toBeGreaterThan(0)

    // Unpowered
    const resOff = simulateDcMotor(
      { id: "motor1", type: "dc-motor", name: "DC Motor", x: 0, y: 0, rotation: 0, metadata: {} },
      pins,
      { [pinPos.id]: 0, [pinNeg.id]: 0 }
    )
    expect(resOff.flags.isSpinning).toBe(false)
  })

  it("simulates Photoresistor light level response", () => {
    const def = getComponentDefinition("photoresistor")!
    const pins = instantiatePins("ldr1", def.pinTemplates)
    const vccPin = pins.find((p) => p.name === "VCC")!
    const gndPin = pins.find((p) => p.name === "GND")!
    const doPin = pins.find((p) => p.name === "DO")!

    const resBright = simulatePhotoresistor(
      { id: "ldr1", type: "photoresistor", name: "LDR", x: 0, y: 0, rotation: 0, metadata: { lightLevel: 0.9 } },
      pins,
      { [vccPin.id]: 5, [gndPin.id]: 0 }
    )
    expect(resBright.flags.powered).toBe(true)
    expect(resBright.pinStates[doPin.id].state).toBe("LOW")

    const resDark = simulatePhotoresistor(
      { id: "ldr1", type: "photoresistor", name: "LDR", x: 0, y: 0, rotation: 0, metadata: { lightLevel: 0.1 } },
      pins,
      { [vccPin.id]: 5, [gndPin.id]: 0 }
    )
    expect(resDark.pinStates[doPin.id].state).toBe("HIGH")
  })

  it("simulates PIR motion sensor detection", () => {
    const def = getComponentDefinition("pir-motion-sensor")!
    const pins = instantiatePins("pir1", def.pinTemplates)
    const vccPin = pins.find((p) => p.name === "VCC")!
    const gndPin = pins.find((p) => p.name === "GND")!
    const outPin = pins.find((p) => p.name === "OUT")!

    const resMotion = simulatePirMotionSensor(
      { id: "pir1", type: "pir-motion-sensor", name: "PIR", x: 0, y: 0, rotation: 0, metadata: { motionDetected: true } },
      pins,
      { [vccPin.id]: 5, [gndPin.id]: 0 }
    )
    expect(resMotion.flags.motionDetected).toBe(true)
    expect(resMotion.pinStates[outPin.id].state).toBe("HIGH")
  })

  it("allows wiring between components without false rejections", () => {
    const ardDef = getComponentDefinition("arduino-uno")!
    const ledDef = getComponentDefinition("led")!
    const ardPins = instantiatePins("ard1", ardDef.pinTemplates)
    const ledPins = instantiatePins("led1", ledDef.pinTemplates)

    const d13 = ardPins.find((p) => p.name === "D13")!
    const anode = ledPins.find((p) => p.name === "anode")!

    const valid = canConnectPins(ardDef, d13, ledDef, anode, [], "ard1", "led1")
    expect(valid).toBe(true)

    // Connecting pin to itself should be disallowed
    const invalidSamePin = canConnectPins(ardDef, d13, ardDef, d13, [], "ard1", "ard1")
    expect(invalidSamePin).toBe(false)
  })

  it("translates AI generated circuit blueprint into canvas components and wires", async () => {
    const { translateBlueprintToSimulator } = await import("@/lib/simulator/ai/circuit-translator")
    const translated = translateBlueprintToSimulator({
      logic: "ESP32 with OLED and DHT22",
      components: [
        { id: "esp32_1", type: "esp32-devkit" },
        { id: "oled_1", type: "ssd1306" },
        { id: "dht_1", type: "dht22" },
      ],
      wires: [
        { from: "esp32_1:3V3", to: "oled_1:VCC" },
        { from: "esp32_1:GND", to: "oled_1:GND" },
        { from: "esp32_1:IO21", to: "oled_1:SDA" },
        { from: "esp32_1:IO22", to: "oled_1:SCL" },
        { from: "esp32_1:3V3", to: "dht_1:VCC" },
        { from: "esp32_1:GND", to: "dht_1:GND" },
        { from: "esp32_1:IO4", to: "dht_1:SDA" },
      ],
      arduinoCode: "void setup() {}",
      bom: [],
    })

    expect(translated.components.length).toBe(3)
    expect(translated.wires.length).toBe(7)
    expect(translated.components[0].type).toBe("esp32-devkit")
    expect(translated.components[1].type).toBe("ssd1306")
    expect(translated.components[2].type).toBe("dht22")
  })
})
