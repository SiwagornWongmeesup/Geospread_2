# GeoSpread — กฎของ AI Agent (AI Agent Rules)

> ไฟล์นี้ถูกโหลดอัตโนมัติโดยผู้ช่วย AI โค้ดดิ้ง (Antigravity, Cursor, Copilot ฯลฯ) เพื่อบังคับใช้กฎและข้อตกลงตลอดทั้งโปรเจกต์ GeoSpread

---

## ข้อมูลโปรเจกต์ (Project Identity)

**GeoSpread** คือ **แพลตฟอร์มแจ้งเตือนความปลอดภัยของชุมชนที่อิงตามตำแหน่ง (Location-based Community Safety Platform)**
- ใช้ JavaScript ตลอดทั้งโปรเจกต์ (Frontend: JavaScript, Backend: JavaScript)
- ผู้ใช้รับการแจ้งเตือนแบบเรียลไทม์, แชทใน Event Room, และขอความช่วยเหลือได้
- ข้อมูลมาจาก: รายงานจากชุมชน (Community Reports) เป็นหลัก

---

## เทคโนโลยีบังคับใช้ (Technology Stack — Non-Negotiable)

**ห้าม** แนะนำให้เปลี่ยนเทคโนโลยีเหล่านี้ การตัดสินใจถือเป็นที่สิ้นสุด

| ส่วน (Layer) | เทคโนโลยี |
|---|---|
| Frontend Framework | Nuxt 4 + Vue 3 |
| Frontend Language | JavaScript |
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
| ใช้ `$grill-with-docs` | ก่อนตัดสินใจเรื่องฟีเจอร์ข้ามระบบ หรือเมื่อ requirement ยังคลุมเครือ |

---

## ดัชนีเอกสาร (Documentation Index)

ก่อนที่จะคาดเดา ให้อ่านเอกสารที่เกี่ยวข้อง:

- **ภาพรวมและวิสัยทัศน์:** `docs/01_Project_Vision.md`
- **ข้อกำหนดผลิตภัณฑ์:** `docs/02_Product_Requirements.md`
- **สถาปัตยกรรม:** `docs/03_System_Architecture.md`
- **การออกแบบ API:** `docs/06_API_Design.md`
- **ฐานข้อมูล:** `docs/05_Database_Design.md`
- **การจัดการของ AI:** `docs/10_AI_CONTEXT.md`

---

## Workflow สำหรับ Requirement และเอกสาร

สำหรับงานที่มีผลต่อหลายส่วนของระบบ ให้เริ่มด้วย `$grill-with-docs` ก่อนออกแบบหรือเขียนโค้ด เพื่อถามและยืนยันการตัดสินใจเป็นรอบ ๆ โดยใช้เอกสาร GeoSpread ด้านบนเป็นข้อมูลตั้งต้น ไม่สร้างเอกสารสเปกซ้ำ

- เก็บคำศัพท์ธุรกิจที่ตกลงแล้วไว้ที่ `CONTEXT.md` เฉพาะเมื่อมีคำศัพท์ใหม่ที่ชัดเจน; ไฟล์นี้เป็น glossary เท่านั้น ไม่ใช่ technical spec
- เก็บการตัดสินใจที่ย้อนกลับยากและมี trade-off จริงเท่านั้นใน `docs/adr/`; สร้างเมื่อจำเป็น ไม่ต้องสร้างโฟลเดอร์ล่วงหน้า
- หลังยืนยัน requirement แล้ว ค่อยเลือก agent ตามหน้าที่ (`project-manager` วางแผน, `frontend-agent`/`backend-agent` ลงมือ, `qa-agent` ตรวจสอบ)
