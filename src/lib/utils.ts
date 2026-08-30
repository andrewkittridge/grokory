import type { CSSProperties } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function motionDelay(d: number): CSSProperties {
  return { "--d": Math.min(d, 10) } as CSSProperties
}
