// อ่านพิกัดจากข้อความที่ผู้ใช้พิมพ์หรือวาง เช่น
//   "13.7046, 100.6014"  "13.7046 100.6014"
//   https://www.google.com/maps/@13.7046,100.6014,15z
//   https://www.google.com/maps?q=13.7046,100.6014
//   https://www.google.com/maps/place/.../data=!3d13.7046!4d100.6014
// คืนค่า { status: 'none' } เมื่อข้อความไม่ใช่พิกัด/ลิงก์แผนที่ (ให้ไปค้นชื่อสถานที่ต่อ)
//      { status: 'ok', lat, lng, swapped } เมื่ออ่านพิกัดได้
//      { status: 'error', messageKey } เมื่อดูเหมือนพิกัด/ลิงก์ แต่ใช้ไม่ได้ (key ใน locales: coordinates.*)

const number = String.raw`[-+]?\d{1,3}(?:\.\d+)?`
const pairPattern = new RegExp(String.raw`^\s*(${number})\s*[,\s]\s*(${number})\s*$`)
const shortLinkPattern = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i
const mapsLinkPattern = /^https?:\/\/([a-z0-9-]+\.)*google\.[a-z.]+\/maps|^https?:\/\/maps\.google\./i

const isLat = (value) => value >= -90 && value <= 90
const isLng = (value) => value >= -180 && value <= 180

const toResult = (first, second) => {
  const a = Number(first)
  const b = Number(second)
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { status: 'error', messageKey: 'coordinates.unreadable' }
  }
  if (isLat(a) && isLng(b)) return { status: 'ok', lat: a, lng: b, swapped: false }
  // ผู้ใช้มักใส่สลับเป็น ลองจิจูด, ละติจูด (เช่น 100.6014, 13.7046)
  if (isLat(b) && isLng(a)) return { status: 'ok', lat: b, lng: a, swapped: true }
  return { status: 'error', messageKey: 'coordinates.outOfRange' }
}

const fromMapsLink = (text) => {
  // ลำดับความสำคัญ: พิกัดหมุดจริง (!3d/!4d) > q/query/ll/destination > ตำแหน่งกล้อง (@lat,lng)
  const pinned = text.match(new RegExp(String.raw`!3d(${number})!4d(${number})`))
  if (pinned) return toResult(pinned[1], pinned[2])

  let url
  try {
    url = new URL(text)
  } catch {
    return null
  }
  for (const key of ['q', 'query', 'll', 'destination', 'center']) {
    const value = url.searchParams.get(key)
    const match = value?.match(pairPattern)
    if (match) return toResult(match[1], match[2])
  }

  const camera = text.match(new RegExp(String.raw`@(${number}),(${number})`))
  if (camera) return toResult(camera[1], camera[2])
  return null
}

export const parseCoordinates = (input) => {
  const text = String(input || '').trim()
  if (!text) return { status: 'none' }

  if (shortLinkPattern.test(text)) {
    return { status: 'error', messageKey: 'coordinates.shortLink' }
  }

  if (mapsLinkPattern.test(text)) {
    return fromMapsLink(text) ?? { status: 'error', messageKey: 'coordinates.noneInLink' }
  }

  // ต้องมีทศนิยมอย่างน้อยหนึ่งค่า กันเลขธรรมดาอย่าง "101 1" ถูกตีความเป็นพิกัด
  const pair = text.match(pairPattern)
  if (pair && /\d\.\d/.test(text)) return toResult(pair[1], pair[2])

  // ตัวเลขล้วนแต่ไม่ครบคู่ เช่น "13.7046" ถือว่าตั้งใจใส่พิกัดแต่ยังไม่ครบ
  if (/^[\d\s.,+-]+$/.test(text) && /\d+\.\d+/.test(text)) {
    return { status: 'error', messageKey: 'coordinates.incomplete' }
  }

  return { status: 'none' }
}
