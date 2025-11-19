import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips HTML tags and decodes HTML entities from a string
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  // Decode HTML entities
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  let decoded = txt.value;

  // Remove HTML tags
  const tmp = document.createElement('div');
  tmp.innerHTML = decoded;
  const text = tmp.textContent || tmp.innerText || '';

  // Clean up extra whitespace
  return text.replace(/\s+/g, ' ').trim();
}
