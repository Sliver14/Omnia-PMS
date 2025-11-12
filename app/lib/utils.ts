import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names conditionally and merge Tailwind classes intelligently.
 * Example: cn("p-4", condition && "bg-red-500") → "p-4 bg-red-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}