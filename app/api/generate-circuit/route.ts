import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_AIOT_BACKEND_URL || "http://localhost:3000"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""

const HARDWARE_CATALOG = [
  {
    id: "esp32-devkit",
    name: "ESP32 DevKit V1",
    pins: ["VIN", "GND", "3V3", "RST", "IO23", "IO22", "IO21", "IO19", "IO18", "IO5", "IO17", "IO16", "IO4", "IO0", "IO2", "IO15", "IO13", "IO12", "IO14", "IO27", "IO26", "IO25", "IO33", "IO32", "IO35", "IO34", "TXD0", "RXD0"],
    hint: "Main 32-bit Wi-Fi & Bluetooth microcontroller with capacitive touch and DAC/ADC."
  },
  {
    id: "arduino-uno",
    name: "Arduino Uno R3",
    pins: ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "A0", "A1", "A2", "A3", "A4", "A5", "5V", "3.3V", "GND", "VIN", "RESET"],
    hint: "Classic 8-bit AVR microcontroller development board."
  },
  {
    id: "dht11",
    name: "DHT11 / DHT22 Sensor",
    pins: ["VCC", "DATA", "GND"],
    hint: "Digital temperature and relative humidity sensor."
  },
  {
    id: "hc-sr04",
    name: "HC-SR04 Ultrasonic Sensor",
    pins: ["vcc", "trig", "echo", "gnd"],
    hint: "Ultrasonic rangefinder measuring distances from 2cm to 400cm."
  },
  {
    id: "lcd1602",
    name: "LCD 1602 Display (I2C)",
    pins: ["GND", "VCC", "SDA", "SCL"],
    hint: "16x2 alphanumeric liquid crystal display with I2C PCF8574 backpack."
  },
  {
    id: "servo",
    name: "SG90 Micro Servo",
    pins: ["gnd", "vcc", "signal"],
    hint: "Mini 9g servo motor with 0-180 degree rotation controlled via PWM."
  },
  {
    id: "potentiometer",
    name: "Rotary Potentiometer",
    pins: ["vcc", "sig", "gnd"],
    hint: "10k ohm rotary analog dial for variable voltage division."
  },
  {
    id: "led",
    name: "LED",
    pins: ["anode", "cathode"],
    hint: "Standard light emitting diode (anode positive, cathode negative)."
  },
  {
    id: "resistor",
    name: "Resistor (220 Ohm / 10k Ohm)",
    pins: ["pin1", "pin2"],
    hint: "Current limiting or pull-up/pull-down passive resistor."
  },
  {
    id: "buzzer",
    name: "Piezo Buzzer",
    pins: ["positive", "negative"],
    hint: "Acoustic transducer for sound generation and alarms."
  },
  {
    id: "push-button",
    name: "Push Button Switch",
    pins: ["pin1", "pin2", "pin3", "pin4"],
    hint: "Tactile momentary push button for digital inputs."
  },
  {
    id: "relay",
    name: "5V Relay Module",
    pins: ["coil-", "coil+", "NO", "COM", "NC"],
    hint: "Electromechanical relay for switching high voltage / current loads."
  }
]

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const prompt = body?.prompt

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // 1. Try Express backend first if reachable
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/generate-circuit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(12000),
      })

      if (backendRes.ok) {
        const data = await backendRes.json()
        return NextResponse.json(data)
      }
    } catch {
      // Backend unavailable or timed out, fallback to direct Gemini API
    }

    // 2. Direct Gemini Fallback
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AIoT backend unavailable and GEMINI_API_KEY is not configured." },
        { status: 503 }
      )
    }

    const systemPrompt = `You are AIoT Astra's expert embedded systems engineer.
Given the user prompt, design a working circuit schematic, write full Arduino C++ code, and generate a Bill of Materials.
OUTPUT ONLY RAW VALID JSON with no markdown formatting.

### COMPONENT CATALOG:
${JSON.stringify(HARDWARE_CATALOG, null, 2)}

### JSON SCHEMA:
{
  "logic": "string",
  "components": [
    { "id": "string (e.g. esp32_1, led_1)", "type": "string (matching catalog id)", "name": "string" }
  ],
  "wires": [
    { "from": "component_id:pin_name", "to": "component_id:pin_name" }
  ],
  "arduinoCode": "string (Complete compilable Arduino C++ sketch with setup and loop)",
  "explanation": "string (Detailed circuit and wiring explanation)",
  "bom": [
    { "name": "string", "quantity": 1, "estimatedCost": "$x.xx", "description": "string" }
  ]
}`

    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]
    let lastErr: Error | null = null

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          }),
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 150)}`)
        }

        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text)
          return NextResponse.json(parsed)
        }
      } catch (err) {
        lastErr = err as Error
      }
    }

    throw lastErr || new Error("Failed to generate circuit via Gemini.")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
