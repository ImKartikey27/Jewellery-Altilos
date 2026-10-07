import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"

import { env } from "@/lib/env"

let cached: Promise<string> | null = null

export function getLeadMagnetFileBase64(): Promise<string> {
  if (!cached) {
    const absolute = path.resolve(process.cwd(), env.LEAD_MAGNET_FILE_PATH)
    cached = readFile(absolute).then((buffer) => buffer.toString("base64"))
    cached.catch(() => {
      cached = null
    })
  }
  return cached
}
