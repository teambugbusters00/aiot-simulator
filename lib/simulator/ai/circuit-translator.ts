import type { PlacedComponent, Wire } from "@/types/simulator"
import { getComponentDefinition } from "@/lib/simulator/registry"
import { generateId } from "@/lib/simulator/utils/id"

export interface RawBlueprintComponent {
  id: string
  type: string
  reactComponent?: string
  name?: string
  wiringConfig?: {
    selector?: string
    pinOrder?: string[]
  }
}

export interface RawBlueprintWire {
  from: string
  to: string
}

export interface RawBlueprintBOMItem {
  name: string
  quantity: number
  estimatedCost: string
  description: string
}

export interface RawCircuitBlueprint {
  components: RawBlueprintComponent[]
  wires: RawBlueprintWire[]
  logic: string
  arduinoCode: string
  explanation?: string
  bom?: RawBlueprintBOMItem[]
}

export interface TranslatedCircuit {
  components: PlacedComponent[]
  wires: Wire[]
  arduinoCode: string
  logic: string
  explanation: string
  bom: RawBlueprintBOMItem[]
}

const TYPE_MAP: Record<string, string> = {
  "wokwi-esp32-devkit-v1": "esp32-devkit",
  "esp32-devkit-v1": "esp32-devkit",
  "esp32": "esp32-devkit",
  "esp32-devkit": "esp32-devkit",
  "wokwi-arduino-uno": "arduino-uno",
  "arduino-uno": "arduino-uno",
  "arduino": "arduino-uno",
  "wokwi-led": "led",
  "led": "led",
  "wokwi-resistor": "resistor",
  "resistor": "resistor",
  "wokwi-buzzer": "buzzer",
  "buzzer": "buzzer",
  "piezo-buzzer": "buzzer",
  "wokwi-servo": "servo",
  "servo": "servo",
  "sg90": "servo",
  "wokwi-hc-sr04": "hc-sr04",
  "hc-sr04": "hc-sr04",
  "ultrasonic": "hc-sr04",
  "wokwi-dht22": "dht11",
  "dht22": "dht11",
  "wokwi-dht11": "dht11",
  "dht11": "dht11",
  "wokwi-ssd1306": "lcd1602",
  "ssd1306": "lcd1602",
  "oled": "lcd1602",
  "wokwi-lcd1602": "lcd1602",
  "lcd1602": "lcd1602",
  "wokwi-potentiometer": "potentiometer",
  "potentiometer": "potentiometer",
  "wokwi-pushbutton": "push-button",
  "pushbutton": "push-button",
  "push-button": "push-button",
  "wokwi-relay": "relay",
  "relay": "relay",
  "wokwi-pir-motion-sensor": "tilt-switch",
  "pir": "tilt-switch",
  "wokwi-photoresistor-sensor": "potentiometer",
  "photoresistor": "potentiometer",
  "breadboard": "breadboard",
  "battery": "battery",
  "rgb-led": "rgb-led",
  "slide-switch": "slide-switch",
}

function resolveComponentType(rawType: string): string {
  const normalized = rawType.toLowerCase().trim()
  if (TYPE_MAP[normalized]) return TYPE_MAP[normalized]
  const stripped = normalized.replace(/^wokwi-/, "")
  if (TYPE_MAP[stripped]) return TYPE_MAP[stripped]
  if (getComponentDefinition(normalized)) return normalized
  if (getComponentDefinition(stripped)) return stripped
  return "resistor"
}

function resolvePinName(compType: string, rawPin: string, availablePinNames: string[]): string {
  const pin = rawPin.trim()
  const upperPin = pin.toUpperCase()

  // 1. Direct case-insensitive match
  const exact = availablePinNames.find((p) => p.toLowerCase() === pin.toLowerCase())
  if (exact) return exact

  if (compType === "esp32-devkit") {
    // Map D23 -> IO23, D4 -> IO4, etc.
    const dMatch = upperPin.match(/^D(\d+)$/)
    if (dMatch) {
      const ioCandidate = `IO${dMatch[1]}`
      const found = availablePinNames.find((p) => p.toUpperCase() === ioCandidate)
      if (found) return found
    }
    if (upperPin === "GND") {
      return availablePinNames.find((p) => p.startsWith("GND")) || "GND1"
    }
    if (upperPin === "3V3" || upperPin === "3.3V") return "3V3"
    if (upperPin === "5V" || upperPin === "VIN") return "5V"
    if (upperPin === "TX" || upperPin === "TX0" || upperPin === "TXD") return "TXD0"
    if (upperPin === "RX" || upperPin === "RX0" || upperPin === "RXD") return "RXD0"
    if (upperPin === "EN" || upperPin === "RESET") return "RST"
    if (upperPin === "VN") return "SVN"
    if (upperPin === "VP") return "SVP"
  }

  if (compType === "arduino-uno") {
    if (upperPin === "GND") {
      return availablePinNames.find((p) => p.startsWith("GND")) || "GND1"
    }
    if (upperPin === "3.3V" || upperPin === "3V3") return "3.3V"
    if (upperPin === "5V") return "5V"
    if (upperPin === "VIN") return "VIN"
    if (upperPin === "RESET" || upperPin === "RST") return "RESET"
  }

  if (compType === "led") {
    if (["A", "ANODE", "+", "POS", "1"].includes(upperPin)) return "anode"
    if (["C", "CATHODE", "-", "NEG", "GND", "2"].includes(upperPin)) return "cathode"
  }

  if (compType === "resistor") {
    if (["1", "PIN1", "A"].includes(upperPin)) return "pin1"
    if (["2", "PIN2", "B"].includes(upperPin)) return "pin2"
  }

  if (compType === "buzzer") {
    if (["1", "NEG", "GND", "-", "CATHODE"].includes(upperPin)) return "negative"
    if (["2", "POS", "VCC", "SIG", "+", "ANODE"].includes(upperPin)) return "positive"
  }

  if (compType === "hc-sr04") {
    if (upperPin === "VCC") return "vcc"
    if (upperPin === "TRIG") return "trig"
    if (upperPin === "ECHO") return "echo"
    if (upperPin === "GND") return "gnd"
  }

  if (compType === "dht11") {
    if (["SDA", "DATA", "SIG", "OUT"].includes(upperPin)) return "DATA"
    if (["VCC", "5V", "3V3", "3.3V", "+"].includes(upperPin)) return "VCC"
    if (["GND", "-"].includes(upperPin)) return "GND"
  }

  if (compType === "servo") {
    if (["PWM", "SIG", "SIGNAL", "DATA"].includes(upperPin)) return "signal"
    if (["VCC", "V+", "5V", "+"].includes(upperPin)) return "vcc"
    if (["GND", "-"].includes(upperPin)) return "gnd"
  }

  if (compType === "potentiometer") {
    if (["SIG", "SIGNAL", "WIPER", "OUT", "2"].includes(upperPin)) return "sig"
    if (["VCC", "5V", "3V3", "1"].includes(upperPin)) return "vcc"
    if (["GND", "3"].includes(upperPin)) return "gnd"
  }

  if (compType === "push-button") {
    if (["1.L", "1", "A"].includes(upperPin)) return "pin1"
    if (["2.L", "2", "B"].includes(upperPin)) return "pin2"
    if (["1.R", "3", "C"].includes(upperPin)) return "pin3"
    if (["2.R", "4", "D"].includes(upperPin)) return "pin4"
  }

  if (compType === "lcd1602") {
    if (upperPin === "GND") return "GND"
    if (upperPin === "VCC") return "VCC"
    if (upperPin === "SDA") return "SDA"
    if (upperPin === "SCL") return "SCL"
  }

  if (compType === "relay") {
    if (["GND", "COIL-", "1", "DC-"].includes(upperPin)) return "coil-"
    if (["IN", "COIL+", "2", "SIG", "DC+"].includes(upperPin)) return "coil+"
    if (["NO", "NORMALLY_OPEN"].includes(upperPin)) return "NO"
    if (["COM", "COMMON"].includes(upperPin)) return "COM"
    if (["NC", "NORMALLY_CLOSED"].includes(upperPin)) return "NC"
  }

  return availablePinNames[0] || pin
}

export function translateBlueprintToSimulator(blueprint: RawCircuitBlueprint): TranslatedCircuit {
  const components: PlacedComponent[] = []
  const compIdMap = new Map<string, { id: string; type: string; pinNames: string[] }>()

  let mcuFound = false
  const peripherals: RawBlueprintComponent[] = []
  let mcuRaw: RawBlueprintComponent | null = null

  for (const rawComp of blueprint.components) {
    const resolvedType = resolveComponentType(rawComp.reactComponent || rawComp.type)
    if (!mcuFound && (resolvedType === "esp32-devkit" || resolvedType === "arduino-uno")) {
      mcuFound = true
      mcuRaw = rawComp
    } else {
      peripherals.push(rawComp)
    }
  }

  // 1. Position MCU
  if (mcuRaw) {
    const def = getComponentDefinition(resolveComponentType(mcuRaw.reactComponent || mcuRaw.type))
    const defType = def?.type || "esp32-devkit"
    const defPins = def ? def.pinTemplates.map((p) => p.name) : []
    const mcuComp: PlacedComponent = {
      id: mcuRaw.id,
      type: defType,
      name: mcuRaw.name || def?.name || "MCU Board",
      x: 180,
      y: 180,
      rotation: 0,
      metadata: { ...(def?.defaultMetadata || {}) },
    }
    components.push(mcuComp)
    compIdMap.set(mcuRaw.id, { id: mcuComp.id, type: defType, pinNames: defPins })
  }

  // 2. Position Peripherals in clean columns
  peripherals.forEach((rawComp, idx) => {
    const resolvedType = resolveComponentType(rawComp.reactComponent || rawComp.type)
    const def = getComponentDefinition(resolvedType)
    const defPins = def ? def.pinTemplates.map((p) => p.name) : []

    const col = idx % 2
    const row = Math.floor(idx / 2)
    const xBase = mcuRaw ? 820 : 200
    const posX = xBase + col * 200
    const posY = 100 + row * 160

    const comp: PlacedComponent = {
      id: rawComp.id,
      type: resolvedType,
      name: rawComp.name || def?.name || rawComp.type,
      x: Math.round(posX / 20) * 20,
      y: Math.round(posY / 20) * 20,
      rotation: 0,
      metadata: { ...(def?.defaultMetadata || {}) },
    }
    components.push(comp)
    compIdMap.set(rawComp.id, { id: comp.id, type: resolvedType, pinNames: defPins })
  })

  // 3. Connect Wires
  const wires: Wire[] = []

  function parseEndpoint(endpointStr: string): { compId: string; pinName: string } | null {
    if (!endpointStr) return null
    let delimiter = ":"
    if (!endpointStr.includes(":") && endpointStr.includes(".")) {
      delimiter = "."
    }
    const parts = endpointStr.split(delimiter)
    if (parts.length < 2) return null
    return {
      compId: parts[0].trim(),
      pinName: parts.slice(1).join(delimiter).trim(),
    }
  }

  for (const rawWire of blueprint.wires) {
    const fromParsed = parseEndpoint(rawWire.from)
    const toParsed = parseEndpoint(rawWire.to)
    if (!fromParsed || !toParsed) continue

    const fromMeta = compIdMap.get(fromParsed.compId)
    const toMeta = compIdMap.get(toParsed.compId)
    if (!fromMeta || !toMeta) continue

    const resolvedFromPin = resolvePinName(fromMeta.type, fromParsed.pinName, fromMeta.pinNames)
    const resolvedToPin = resolvePinName(toMeta.type, toParsed.pinName, toMeta.pinNames)

    wires.push({
      id: generateId("wire"),
      fromComponentId: fromMeta.id,
      fromPinId: `${fromMeta.id}_${resolvedFromPin}`,
      toComponentId: toMeta.id,
      toPinId: `${toMeta.id}_${resolvedToPin}`,
    })
  }

  return {
    components,
    wires,
    arduinoCode: blueprint.arduinoCode || "",
    logic: blueprint.logic || "",
    explanation: blueprint.explanation || blueprint.logic || "",
    bom: blueprint.bom || [],
  }
}
