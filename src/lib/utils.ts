import type { CSSProperties } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function motionDelay(d: number): CSSProperties {
  return { "--d": String(Math.min(d, 20)) } as CSSProperties
}
