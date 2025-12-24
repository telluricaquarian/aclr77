import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Main className merge helper (used by shadcn/MagicUI)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Backwards-compatible alias for existing components.
 * Many of your components still import `cx` from "@/lib/utils".
 */
export function cx(...inputs: ClassValue[]) {
  return cn(...inputs);
}

/**
 * Focus ring utility used by Button.tsx, etc.
 * You can tweak the colors later if you want.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400 focus-visible:ring-offset-background";
