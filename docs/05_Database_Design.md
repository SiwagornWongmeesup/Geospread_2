# 05 — การออกแบบฐานข้อมูล (Database Design)

> **วัตถุประสงค์ของเอกสาร:** อธิบายกลยุทธ์การจัดการฐานข้อมูล โครงสร้าง Schema รูปแบบข้อมูลเชิงพื้นที่ (Geospatial) และเอนทิตีต่างๆ (Entities) ที่ใช้ในระบบ GeoSpread

---

## สารบัญ

1. [ข้อมูลทั่วไป (Database Stack)](#1-ข้อมูลทั่วไป-database-stack)
2. [แนวทางการออกแบบ (Design Principles)](#2-แนวทางการออกแบบ-design-principles)
3. [ข้อมูลเชิงพื้นที่ (Geospatial Strategy)](#3-ข้อมูลเชิงพื้นที่-geospatial-strategy)
4. [เอนทิตีหลัก (Core Entities)](#4-เอนทิตีหลัก-core-entities)

---

## 1. ข้อมูลทั่วไป (Database Stack)

- **ฐานข้อมูล:** PostgreSQL (ใช้ Supabase หรือ Neon)
- **ส่วนขยาย (Extension):** PostGIS
- **Query:** ใช้ Raw SQL ผ่านไลบรารี `pg` ทั้งหมด
- **การ Migration:** ใช้สคริปต์ `schema.sql` เป็นศูนย์กลางความจริง (Source of Truth)

## 2. แนวทางการออกแบบ (Design Principles)

- ต้องใช้ข้อมูลแบบ **Normalized** หลีกเลี่ยงการเก็บข้อมูลซ้ำซ้อน
- **PostGIS First:** ฟิลด์สถานที่ทั้งหมด (Location) ต้องถูกเก็บเป็น `GEOMETRY(Point, 4326)` เสมอ

## 3. ข้อมูลเชิงพื้นที่ (Geospatial Strategy)

- ค้นหารัศมีด้วย `ST_DWithin()`
- จัดเก็บพิกัด: `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`
- การดึงข้อมูลออกมาใช้: `ST_AsGeoJSON(location)`

## 4. เอนทิตีหลัก (Core Entities)

อิงตามข้อมูลจาก DOCX ระบบจะประกอบด้วยเอนทิตีหลักๆ ดังนี้:

| เอนทิตี (Entity) | คำอธิบาย |
|--------|-------------|
| **User** | ผู้ใช้งานระบบ (id, email, password, profile, role) |
| **Incident** | รายงานเหตุการณ์ย่อยๆ 1 จุด (id, title, desc, severity, location, status) |
| **Event** | ศูนย์กลางเหตุการณ์ใหญ่ (รวบรวมหลาย Incident) (id, category, severity, status) |
| **EventIncident** | ตารางเชื่อม (Join table) ผูก Incident ย่อยเข้ากับ Event ใหญ่ |
| **ChatMessage** | ข้อความใน Event Room (id, event_id, user_id, message, created_at) |
| **HelpRequest** | คำขอความช่วยเหลือที่ระบุพิกัด (id, event_id, user_id, desc, location, status) |
| **FollowedArea** | พื้นที่ หรือ Event ที่ผู้ใช้กดติดตาม (id, user_id, event_id, geometry) |
| **Notification** | แจ้งเตือนของผู้ใช้ (id, user_id, type, message, read_at) |
