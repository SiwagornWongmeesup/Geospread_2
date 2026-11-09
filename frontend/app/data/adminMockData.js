// ข้อมูลจำลองของหน้าแอดมินที่ยังไม่มี API (คำขอความช่วยเหลือ กิจกรรม รายงานวิเคราะห์ การแจ้งเตือน ตั้งค่าระบบ)
// ตัวเลขและสถานะอยู่ที่นี่ ข้อความอยู่ใน locales (adminMock.*) เรียงตาม index เดียวกัน
// TODO: แทนที่ด้วยข้อมูลจริงเมื่อมี API ของแต่ละหน้า แล้วลบไฟล์นี้

export const mockHelpRequests = [
  { id: 1, index: 0, helpType: 'evacuation', people: 2, status: 'pending' },
  { id: 2, index: 1, helpType: 'food', people: 3, status: 'pending' },
  { id: 3, index: 2, helpType: 'medical', people: 1, status: 'in_progress' },
  { id: 4, index: 3, helpType: 'shelter', people: 4, status: 'in_progress' },
  { id: 5, index: 4, helpType: 'vehicle', people: 2, status: 'resolved' },
  { id: 6, index: 5, helpType: 'medical', people: 1, status: 'resolved' },
]

export const mockEvents = [
  { id: 1, index: 0, joined: 42, capacity: 60, status: 'upcoming' },
  { id: 2, index: 1, joined: 25, capacity: 30, status: 'upcoming' },
  { id: 3, index: 2, joined: 18, capacity: 20, status: 'ongoing' },
  { id: 4, index: 3, joined: 36, capacity: 50, status: 'done' },
]

// รายงานรายวันย้อนหลัง 14 วัน [ยืนยันแล้ว, รอตรวจ, ไม่ผ่าน]
export const mockDailyReports = [
  [3, 2, 1], [5, 1, 0], [2, 3, 1], [4, 2, 0], [6, 2, 1], [3, 4, 0], [2, 1, 1],
  [5, 3, 0], [7, 2, 1], [4, 1, 0], [3, 3, 2], [6, 2, 0], [5, 4, 1], [2, 3, 0],
]

export const mockAnalytics = {
  verifiedRate: 64,
  reviewHours: 3.5,
  helpResolved: 18,
  // จำนวนรายงานของพื้นที่ใน adminMock.analytics.areas เรียงตาม index เดียวกัน
  areaReports: [21, 14, 11, 8, 6],
}

export const mockNotifications = [
  { id: 1, index: 0, audience: 'area', reach: 1240 },
  { id: 2, index: 1, audience: 'followers', reach: 860 },
  { id: 3, index: 2, audience: 'all', reach: 12480 },
  { id: 4, index: 3, audience: 'all', reach: 12390 },
]

// วันที่แก้ไขล่าสุดของคู่มือแต่ละหัวข้อ (ข้อมูลจำลอง) ตามลำดับหัวข้อใน utils/emergencyGuides.js
export const mockGuideUpdatedDates = ['2026-10-28', '2026-10-21', '2026-10-14', '2026-09-30', '2026-09-22', '2026-09-10', '2026-08-29', '2026-08-15']

export const mockSystemSettings = {
  requireVerifiedEmail: true,
  reportLimitPerHour: 5,
  reportExpireHours: 24,
  matchDistanceMeters: 300,
  helpExpireHours: 24,
}
