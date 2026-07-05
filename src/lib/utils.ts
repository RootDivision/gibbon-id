import { clsx, type ClassValue } from "clsx"
import type { ReactNode } from "react"
import { createElement, Fragment } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Renders a species name with the Latin binomial (in parentheses) italicised
 * via Tailwind's `italic` utility class.
 * e.g. "White-handed Gibbon (Hylobates lar)" →
 *       White-handed Gibbon (<span class="italic">Hylobates lar</span>)
 * Falls back to the plain string when no parenthetical is found.
 */
export function formatSpeciesName(name: string): ReactNode {
  const match = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(name)
  if (!match) return name
  const [, common, latin] = match
  return createElement(
    Fragment,
    null,
    `${common} (`,
    createElement("span", { className: "italic" }, latin),
    ")",
  )
}
