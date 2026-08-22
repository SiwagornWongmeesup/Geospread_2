# GeoSpread — กฎของ AI Agent (AI Agent Rules)

> ไฟล์นี้ถูกโหลดอัตโนมัติโดยผู้ช่วย AI โค้ดดิ้ง (Antigravity, Cursor, Copilot ฯลฯ) เพื่อบังคับใช้กฎและข้อตกลงตลอดทั้งโปรเจกต์ GeoSpread

---

## ข้อมูลโปรเจกต์ (Project Identity)

**GeoSpread** คือ **แพลตฟอร์มแจ้งเตือนความปลอดภัยของชุมชนที่อิงตามตำแหน่ง (Location-based Community Safety Platform)**
- ใช้ TypeScript ตลอดทั้งโปรเจกต์ (Frontend: TypeScript, Backend: JavaScript/TypeScript)
- ผู้ใช้รับการแจ้งเตือนแบบเรียลไทม์, แชทใน Event Room, และขอความช่วยเหลือได้
- ข้อมูลมาจาก: รายงานจากชุมชน (Community Reports) เป็นหลัก

---

## เทคโนโลยีบังคับใช้ (Technology Stack — Non-Negotiable)

**ห้าม** แนะนำให้เปลี่ยนเทคโนโลยีเหล่านี้ การตัดสินใจถือเป็นที่สิ้นสุด

| ส่วน (Layer) | เทคโนโลยี |
|---|---|
| Frontend Framework | Nuxt 4 + Vue 3 |
| Frontend Language | TypeScript |
| Frontend Styling | Tailwind CSS |
| Map | Mapbox |
| Backend Framework | Express.js |
| Backend Language | JavaScript |
| Database | PostgreSQL + PostGIS |
| Database Driver | Raw SQL (pg) |
| Authentication | JWT |
| Realtime Chat | Socket.io / WebSocket |

---

## กฎข้อห้ามเด็ดขาด (Hard Rules — Prohibited Actions)

| ❌ ห้ามทำ | เหตุผล |
|---|---|
| แก้ไข Schema Database โดยไม่จำเป็น | กระทบต่อโครงสร้างรวมและ Migration ของระบบ |
| ลบไฟล์ใดๆ โดยไม่บอกก่อน | เป็นการกระทำที่ไม่สามารถย้อนกลับได้ |
| ปรับโครงสร้างโปรเจกต์ขนาดใหญ่โดยไม่มีแผน | มีความเสี่ยงสูง ต้องให้มนุษย์ตรวจก่อนเสมอ |
| ดำเนินการต่อเมื่อไม่แน่ใจ | ให้ถามก่อนเสมอ — การทำไปก่อนมักก่อให้เกิดบั๊กสะสม |
| เก็บรหัสผ่าน / API Keys ไว้ในโค้ดดิบ | ผิดกฎความปลอดภัยขั้นร้ายแรง |
| เขียน Business Logic ปะปนใน Controller หรือ Route | ผิดหลักการโครงสร้าง ให้แยก Logic ไปที่ Service / Business Layer เสมอ |

---

## สิ่งที่ต้องทำ (Required Actions)

| ✅ สิ่งที่ต้องทำ | เมื่อใด |
|---|---|
| ถามก่อนทำการเปลี่ยนแปลงเมื่อไม่แน่ใจ | ทุกครั้ง |
| อัปเดต `docs/06_API_Design.md` | ทุกครั้งที่มีการแก้ Endpoint |
| อัปเดต `docs/05_Database_Design.md` | ทุกครั้งที่มีการแก้ Schema |
| สร้างและนำเสนอ Plan ก่อนทำเรื่องซับซ้อน | ก่อนเริ่มเขียนโค้ดปรับแก้ครั้งใหญ่ |

---

## ดัชนีเอกสาร (Documentation Index)

ก่อนที่จะคาดเดา ให้อ่านเอกสารที่เกี่ยวข้อง:

- **ภาพรวมและวิสัยทัศน์:** `docs/01_Project_Vision.md`
- **ข้อกำหนดผลิตภัณฑ์:** `docs/02_Product_Requirements.md`
- **สถาปัตยกรรม:** `docs/03_System_Architecture.md`
- **การออกแบบ API:** `docs/06_API_Design.md`
- **ฐานข้อมูล:** `docs/05_Database_Design.md`
- **การจัดการของ AI:** `docs/10_AI_CONTEXT.md`
