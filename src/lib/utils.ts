import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUrl(url: string): string {
  if (!url) return url;
  
  // Trim whitespace
  url = url.trim();
  
  // If URL already starts with http:// or https://, return as is
  if (url.match(/^https?:\/\//i)) {
    return url;
  }
  
  // If it starts with www., add http://
  if (url.match(/^www\./i)) {
    return `http://${url}`;
  }
  
  return url;
}
