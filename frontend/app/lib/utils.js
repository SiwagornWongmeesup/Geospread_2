import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// รวม class ของ Tailwind แบบ shadcn: class ที่ส่งเข้ามาทีหลังชนะ class เริ่มต้นของคอมโพเนนต์
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
