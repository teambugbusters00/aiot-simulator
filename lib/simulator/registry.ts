import type { ComponentDefinition, ComponentPaletteItem } from "@/types/simulator"
import { arduinoUnoDefinition } from "@/lib/simulator/components/arduino-uno/definition"
import { esp32DevkitDefinition } from "@/lib/simulator/components/esp32-devkit/definition"
import { breadboardDefinition } from "@/lib/simulator/components/breadboard/definition"
import { ledDefinition } from "@/lib/simulator/components/led/definition"
import { resistorDefinition } from "@/lib/simulator/components/resistor/definition"
import { pushButtonDefinition } from "@/lib/simulator/components/push-button/definition"
import { buzzerDefinition } from "@/lib/simulator/components/buzzer/definition"
import { relayDefinition } from "@/lib/simulator/components/relay/definition"
import { potentiometerDefinition } from "@/lib/simulator/components/potentiometer/definition"
import { dht11Definition } from "@/lib/simulator/components/dht11/definition"
import { lcd1602Definition } from "@/lib/simulator/components/lcd1602/definition"
import { batteryDefinition } from "@/lib/simulator/components/battery/definition"
import { slideSwitchDefinition } from "@/lib/simulator/components/slide-switch/definition"
import { speakerDefinition } from "@/lib/simulator/components/speaker/definition"
import { hcSr04Definition } from "@/lib/simulator/components/hc-sr04/definition"
import { servoDefinition } from "@/lib/simulator/components/servo/definition"
import { tiltSwitchDefinition } from "@/lib/simulator/components/tilt-switch/definition"
import { rgbLedDefinition } from "@/lib/simulator/components/rgb-led/definition"
import { irReceiverDefinition } from "@/lib/simulator/components/ir-receiver/definition"
import { dcMotorDefinition } from "@/lib/simulator/components/dc-motor/definition"
import { photoresistorDefinition } from "@/lib/simulator/components/photoresistor/definition"
import { pirMotionSensorDefinition } from "@/lib/simulator/components/pir-motion-sensor/definition"
import { ssd1306Definition } from "@/lib/simulator/components/ssd1306/definition"
import { dht22Definition } from "@/lib/simulator/components/dht22/definition"

const DEFINITIONS: ComponentDefinition[] = [
  arduinoUnoDefinition,
  esp32DevkitDefinition,
  breadboardDefinition,
  ledDefinition,
  resistorDefinition,
  pushButtonDefinition,
  buzzerDefinition,
  dcMotorDefinition,
  relayDefinition,
  potentiometerDefinition,
  photoresistorDefinition,
  pirMotionSensorDefinition,
  dht11Definition,
  dht22Definition,
  lcd1602Definition,
  ssd1306Definition,
  batteryDefinition,
  slideSwitchDefinition,
  speakerDefinition,
  hcSr04Definition,
  servoDefinition,
  tiltSwitchDefinition,
  rgbLedDefinition,
  irReceiverDefinition,
]

const ALIASES: Record<string, string> = {
  "wokwi-esp32-devkit-v1": "esp32-devkit",
  "wokwi-dht22": "dht22",
  "wokwi-ssd1306": "ssd1306",
  "wokwi-hc-sr04": "hc-sr04",
  "wokwi-pir-motion-sensor": "pir-motion-sensor",
  "wokwi-buzzer": "buzzer",
  "wokwi-servo": "servo",
  "wokwi-photoresistor-sensor": "photoresistor",
  "photoresistor-sensor": "photoresistor",
  "ldr": "photoresistor",
  "wokwi-potentiometer": "potentiometer",
  "wokwi-led": "led",
  "wokwi-pushbutton": "push-button",
  "wokwi-resistor": "resistor",
  "motor": "dc-motor",
  "dcmotor": "dc-motor",
  "oled": "ssd1306",
}

const registry = new Map<string, ComponentDefinition>(
  DEFINITIONS.map((d) => [d.type, d])
)

export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  const resolved = ALIASES[type] || type
  return registry.get(resolved)
}

export function getAllDefinitions(): ComponentDefinition[] {
  return DEFINITIONS
}

export function getPaletteItems(): ComponentPaletteItem[] {
  return DEFINITIONS.map((d) => ({
    type: d.type,
    name: d.name,
    category: d.category,
  }))
}

export function registerComponent(definition: ComponentDefinition): void {
  registry.set(definition.type, definition)
}
