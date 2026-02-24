/**
 * A utility function that merges Tailwind CSS classes.
 * It uses `clsx` to conditionally apply classes and `tailwind-merge` to resolve conflicting classes.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} // Added a comment to trigger rebuild
