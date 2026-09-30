#!/usr/bin/env node
/**
 * Build-time step: fetches a pinned arduino-cli binary and installs the
 * arduino:avr core (avr-gcc, avr-libc, the Arduino core sources) into
 * `.avr-toolchain/`, which is *not* committed to git — it's vendored fresh
 * on every build (local dev and Vercel's build step both have full
 * internet access).
 *
 * `next.config.mjs` tells Next.js to bundle `.avr-toolchain/` into the
 * `/api/compile` function's output so it's present at runtime, where
 * outbound network access is otherwise unavailable/undesirable.
 *
 * Run automatically via `npm run build` (see package.json `prebuild`).
 * Safe to re-run — skips work if already vendored.
 */
import { existsSync, mkdirSync, chmodSync, createWriteStream } from "node:fs"
import { execFileSync } from "node:child_process"
import { pipeline } from "node:stream/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const TOOLCHAIN_DIR = path.join(ROOT, ".avr-toolchain")
const CLI_PATH = path.join(TOOLCHAIN_DIR, "arduino-cli")
const ARDUINO_DATA_DIR = path.join(TOOLCHAIN_DIR, "data")

// Pin an exact version — never fetch "latest" for a build dependency.
const ARDUINO_CLI_VERSION = "1.5.1"
const ARDUINO_CLI_ASSET = `arduino-cli_${ARDUINO_CLI_VERSION}_Linux_64bit.tar.gz`
const ARDUINO_CLI_URL = `https://github.com/arduino/arduino-cli/releases/download/v${ARDUINO_CLI_VERSION}/${ARDUINO_CLI_ASSET}`

async function download(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${url} -> ${res.status}`)
  await pipeline(res.body, createWriteStream(destPath))
}

async function main() {
  if (process.platform !== "linux") {
    console.log(`[vendor-avr-toolchain] Platform is "${process.platform}". The bundled AVR compiler binary is built for Linux CI/Vercel environments. Skipping local binary download.`)
    return
  }

  if (existsSync(CLI_PATH) && existsSync(path.join(ARDUINO_DATA_DIR, "packages"))) {
    console.log("[vendor-avr-toolchain] already vendored, skipping")
    return
  }

  mkdirSync(TOOLCHAIN_DIR, { recursive: true })
  mkdirSync(ARDUINO_DATA_DIR, { recursive: true })

  console.log(`[vendor-avr-toolchain] downloading arduino-cli ${ARDUINO_CLI_VERSION}...`)
  const tarPath = path.join(TOOLCHAIN_DIR, "arduino-cli.tar.gz")
  await download(ARDUINO_CLI_URL, tarPath)
  execFileSync("tar", ["xzf", tarPath, "-C", TOOLCHAIN_DIR])
  chmodSync(CLI_PATH, 0o755)

  console.log("[vendor-avr-toolchain] installing arduino:avr core (this takes a minute)...")
  const env = { ...process.env, ARDUINO_DIRECTORIES_DATA: ARDUINO_DATA_DIR }
  execFileSync(CLI_PATH, ["core", "update-index"], { env, stdio: "inherit" })
  execFileSync(CLI_PATH, ["core", "install", "arduino:avr"], { env, stdio: "inherit" })

  console.log("[vendor-avr-toolchain] done")
}

main().catch((err) => {
  console.warn("[vendor-avr-toolchain] Warning:", err.message)
  console.warn("Skipping vendor step so build can proceed.")
})
