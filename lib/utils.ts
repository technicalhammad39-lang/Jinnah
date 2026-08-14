import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPublicUploadUrl(url?: string | null): string {
  if (!url) return "/placeholder-image.jpg"; 

  // If it's a firebase URL or picsum or external URL not belonging to our uploads, return as is
  if (url.startsWith("http") && !url.includes("jinnah-hardwarestore.com/uploads") && !url.includes("jinnahhardware.com/uploads")) {
    return url;
  }

  // If it's an absolute URL from our own domain, strip the domain and keep the relative path
  let relativePath = url;
  if (url.includes("jinnah-hardwarestore.com/uploads")) {
    relativePath = url.split("jinnah-hardwarestore.com")[1];
  } else if (url.includes("jinnahhardware.com/uploads")) {
    relativePath = url.split("jinnahhardware.com")[1];
  }

  // Ensure it starts with /uploads/ if it doesn't already
  if (!relativePath.startsWith("/") && !relativePath.startsWith("http")) {
     // Check if it's just "products/image.jpg"
     if (relativePath.includes("/")) {
         relativePath = `/uploads/${relativePath}`;
     } else {
         relativePath = `/uploads/general/${relativePath}`;
     }
  }

  // Normalize slashes (replace // with /) except for http://
  relativePath = relativePath.replace(/([^:]\/)\/+/g, "$1");

  return relativePath;
}
