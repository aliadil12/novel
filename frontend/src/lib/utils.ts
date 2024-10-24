
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(src: string | null | undefined): string {
  if (!src) return '/placeholder.svg';
  if (src.startsWith('http')) return src;
  // تأكد من أن المسار يبدأ بـ /uploads فقط مرة واحدة
  return src.startsWith('/uploads') ? src : `/uploads${src}`;
}
