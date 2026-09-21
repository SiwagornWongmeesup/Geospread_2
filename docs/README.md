# GeoSpread

> **แพลตฟอร์มแจ้งเตือนความปลอดภัยชุมชนที่อิงตามตำแหน่งที่ตั้ง (Location-based Community Safety Platform)**

GeoSpread ช่วยให้ผู้ใช้ทราบถึงเหตุการณ์สำคัญต่างๆ ที่เกิดขึ้นในพื้นที่ของตน จากรายงานเหตุการณ์จากชุมชน (Community Reports) นอกจากนี้ยังมีฟีเจอร์สำหรับการขอความช่วยเหลือ การพูดคุยแชทในห้องเหตุการณ์เฉพาะกิจ (Event Room) และการติดตามพื้นที่ต่างๆ ที่สำคัญกับคุณ

---

## ดัชนีเอกสาร (Documentation Index)

| ไฟล์ | จุดประสงค์ |
|------|---------|
| [01_Project_Vision.md](./01_Project_Vision.md) | วิสัยทัศน์ เป้าหมาย และกลยุทธ์ของโปรเจกต์ |
| [02_Product_Requirements.md](./02_Product_Requirements.md) | ข้อกำหนดฟีเจอร์ หมวดหมู่เหตุการณ์ และกฎการแจ้งเตือน |
| [03_System_Architecture.md](./03_System_Architecture.md) | เทคโนโลยีที่เลือกใช้ สถาปัตยกรรม และรูปแบบการติดตั้ง |
| [04_Development_Guidelines.md](./04_Development_Guidelines.md) | มาตรฐานการโค้ด กฎการใช้ Git ความปลอดภัย |
| [05_Database_Design.md](./05_Database_Design.md) | โครงสร้าง Database และการจัดการข้อมูลเชิงพื้นที่ |
| [06_API_Design.md](./06_API_Design.md) | การออกแบบ API และรูปแบบ Response |
| [07_UI_UX.md](./07_UI_UX.md) | หลักการทาง UI/UX และการออกแบบหน้าจอ |
| [08_Roadmap.md](./08_Roadmap.md) | แผนการพัฒนา (Roadmap) ของโปรเจกต์ |
| [10_AI_CONTEXT.md](./10_AI_CONTEXT.md) | ข้อมูลบริบท ขอบเขต และหน้าที่สำหรับ AI Developer |
| [11_Backend_Folder_Structure.md](./11_Backend_Folder_Structure.md) | โครงสร้างโฟลเดอร์ Backend (3-Tier Architecture) |
| [12_Frontend_Folder_Structure.md](./12_Frontend_Folder_Structure.md) | โครงสร้างโฟลเดอร์ Frontend และการแยก Desktop/Mobile Component |
| [13_Incident_Reporting_Concept.md](./13_Incident_Reporting_Concept.md) | แนวคิดการรับรายงานแบบยืดหยุ่น การจัดประเภท และกติกาแผนที่ |
| [CHANGELOG.md](./CHANGELOG.md) | บันทึกการเปลี่ยนแปลง (Version History) |

---

## Workflow สำหรับงานฟีเจอร์ข้ามระบบ

เริ่มงานที่ requirement ยังไม่ชัดหรือกระทบหลายส่วนด้วย `$grill-with-docs` โดยอ่านเอกสารในตารางด้านบนเป็นแหล่งอ้างอิงหลักก่อน คำศัพท์ที่ตกลงใหม่จะอยู่ใน `CONTEXT.md` และการตัดสินใจเชิงสถาปัตยกรรมที่ย้อนกลับยากเท่านั้นจะอยู่ใน `docs/adr/` ทั้งสองรายการสร้างเมื่อจำเป็น เพื่อไม่ให้ซ้ำกับเอกสารผลิตภัณฑ์, API และฐานข้อมูลที่มีอยู่แล้ว

---

## ภาพรวมแบบเร็ว (Quick Overview)

| คุณสมบัติ | รายละเอียด |
|----------|--------|
| **ประเภทของระบบ** | แพลตฟอร์มแจ้งเตือนความปลอดภัยอิงตามตำแหน่งที่ตั้ง |
| **ฟรอนต์เอนด์ (Frontend)** | Nuxt 4, Vue 3, JavaScript, Tailwind CSS |
| **แบ็กเอนด์ (Backend)** | Express.js, JavaScript |
| **ระบบเรียลไทม์ (Real-time)** | WebSocket / Socket.io |
| **ฐานข้อมูล** | PostgreSQL + PostGIS |
| **Database Driver** | Raw SQL (pg) |
| **Realtime** | Socket.io / WebSocket |
| **การยืนยันตัวตน (Auth)** | JWT |
| **การเก็บรูปภาพ** | Cloudinary |
| **พื้นที่ติดตั้งฟรอนต์เอนด์** | Vercel |
| **พื้นที่ติดตั้งแบ็กเอนด์** | Render |
| **ผู้ให้บริการฐานข้อมูล** | Supabase PostgreSQL หรือ Neon PostgreSQL |

---

## การเริ่มต้นระบบ (Getting Started)

> (รอระบุ) ขั้นตอนการตั้งค่าโปรเจกต์บนเครื่อง Local

---

## การส่งคำขอแก้ไขโค้ด (Contributing)

ก่อนที่คุณจะเข้ามาร่วมเขียนโค้ด กรุณาอ่านเอกสารต่อไปนี้:

1. [Development Guidelines](./04_Development_Guidelines.md) — มาตรฐานการทำงาน
2. [API Design](./06_API_Design.md) — รูปแบบมาตรฐานของ API
3. [Database Design](./05_Database_Design.md) — โครงสร้างและกฎของการแก้ไข Database
4. [AI Context](./10_AI_CONTEXT.md) — ถ้าคุณคือ AI กรุณาอ่านและปฏิบัติตามอย่างเคร่งครัด

---

## สิทธิ์การใช้งาน (License)

> (รอระบุ)
