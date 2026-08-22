# บันทึกการเปลี่ยนแปลง (Changelog)

การเปลี่ยนแปลงที่สำคัญทั้งหมดของ GeoSpread จะถูกบันทึกไว้ในไฟล์นี้

โปรเจกต์นี้อ้างอิงตามรูปแบบ [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
และข้อความ Commit ต้องเป็นไปตามมาตรฐาน [Conventional Commits](https://www.conventionalcommits.org/)

---

## รูปแบบ (Format)

แต่ละการบันทึกจะใช้โครงสร้างดังต่อไปนี้:

```
## [Version] — YYYY-MM-DD

### เพิ่มเติม (Added)
- ฟีเจอร์ใหม่ หรือความสามารถใหม่

### เปลี่ยนแปลง (Changed)
- การเปลี่ยนแปลงในระบบเดิม

### แก้ไข (Fixed)
- แก้ไขบั๊ก

### ลบออก (Removed)
- ฟีเจอร์ที่ถูกลบออก หรือโค้ดที่เลิกใช้งานแล้ว

### ความปลอดภัย (Security)
- การอัปเดตด้านความปลอดภัย

### เอกสารประกอบ (Documentation)
- การเปลี่ยนแปลงเฉพาะไฟล์เอกสาร
```

---

## [ยังไม่ปล่อย (Unreleased)]

### เพิ่มเติม (Added)
- สร้าง `backend/db/schema.sql` เพื่อกำหนดตารางข้อมูลที่รองรับ PostGIS และ GIST spatial indexing
- เพิ่ม Utility จัดการ Connection Pool `backend/db/index.js` โดยใช้ `pg` (node-postgres)
- เพิ่มสคริปต์ `backend/db/init-db.js` เพื่อจำลองระบบฐานข้อมูล
- เพิ่มเทมเพลตไฟล์ Environment (`.env` และ `.env.example`)

### เปลี่ยนแปลง (Changed)
- ย้ายไฟล์คอนฟิกมาที่รากของโปรเจกต์
- เปลี่ยนมาใช้ Raw SQL ผ่าน node-postgres (`pg`) เป็นหลักแทนการใช้ ORM

### เอกสารประกอบ (Documentation)
- แปลและอัปเดตโครงสร้างเอกสาร `docs/` ทั้งหมดเป็นภาษาไทยและรองรับแนวคิดใหม่ (Event Room, AI Workflow)
- ไฟล์เอกสารเริ่มต้น:
  - `README.md` — ดัชนีเอกสารและภาพรวม
  - `01_Project_Vision.md` — วิสัยทัศน์ผลิตภัณฑ์และเป้าหมาย
  - `02_Product_Requirements.md` — ข้อกำหนดผลิตภัณฑ์และฟีเจอร์
  - `03_System_Architecture.md` — สถาปัตยกรรมระบบ
  - `04_Development_Guidelines.md` — มาตรฐานการเขียนโค้ดและ Git
  - `05_Database_Design.md` — โครงสร้างฐานข้อมูล
  - `06_API_Design.md` — การออกแบบ API
  - `07_UI_UX.md` — การออกแบบ UI/UX
  - `08_Roadmap.md` — แผนงานการพัฒนา (MVP)
  - `09_Open_Data_Integration.md` — การนำเข้า Open Data
  - `10_AI_CONTEXT.md` — บริบทและกฎสำหรับ AI
  - `CHANGELOG.md` — บันทึกการเปลี่ยนแปลง (ไฟล์นี้)

---

<!-- เพิ่มบันทึกเวอร์ชันใหม่ๆ เหนือบรรทัดนี้ -->
