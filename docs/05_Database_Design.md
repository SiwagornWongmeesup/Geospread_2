# 05 — การออกแบบฐานข้อมูล (Database Design)

> **วัตถุประสงค์ของเอกสาร:** อธิบายกลยุทธ์การจัดการฐานข้อมูล โครงสร้าง Schema รูปแบบข้อมูลเชิงพื้นที่ (Geospatial) และเอนทิตีต่างๆ (Entities) ที่ใช้ในระบบ GeoSpread

---

## สารบัญ

1. [ข้อมูลทั่วไป (Database Stack)](#1-ข้อมูลทั่วไป-database-stack)
2. [แนวทางการออกแบบ (Design Principles)](#2-แนวทางการออกแบบ-design-principles)
3. [ข้อมูลเชิงพื้นที่ (Geospatial Strategy)](#3-ข้อมูลเชิงพื้นที่-geospatial-strategy)
4. [เอนทิตีหลัก (Core Entities)](#4-เอนทิตีหลัก-core-entities)
5. [แนวทางการปรับแก้โครงสร้างฐานข้อมูล (Schema Modification & Migration)](#5-แนวทางการปรับแก้โครงสร้างฐานข้อมูล-schema-modification--migration)

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

| เอนทิตี (Entity) | ชื่อตาราง (Table Name) | คำอธิบาย |
|--------|-------------|-------------|
| **User** | `tb_users` | ผู้ใช้งานระบบ (id, email, password, name, lastname, profile, phone, role, trust_score, created_at, updated_at, last_login_at) |
| **IncidentCategory** | `tb_incident_categories` | หมวดใหญ่สำหรับจัดกลุ่ม Type (code, name, icon, active, sort order) |
| **IncidentType** | `tb_incident_types` | Type มาตรฐานที่กำหนด icon, marker color, display mode และ default radius |
| **IncidentKeyword** | `tb_incident_keywords` | Keyword ที่เสนอ Type จากข้อความของผู้ใช้ |
| **IncidentReport** | `tb_incident_reports` | ข้อมูลดิบที่ผู้ใช้ส่ง พร้อม Type ที่เลือก/ระบบเสนอ, PostGIS location และสถานะ Report |
| **IncidentMedia** | `tb_incident_media` | รูปภาพหรือวิดีโอหลายไฟล์ของ IncidentReport |
| **Incident** | `tb_incidents` | เหตุการณ์หลักที่รวม Report หนึ่งรายการหรือหลายรายการ พร้อม severity, credibility, verification และสถานะเหตุ |
| **HelpRequest** | `tb_help_requests` | คำขอความช่วยเหลือที่ระบุพิกัด (id, event_id, user_id, desc, location, status) |
| **Event** | `tb_events` | ศูนย์กลางเหตุการณ์ใหญ่ (รวบรวมหลาย Incident) (id, category, severity, status) |
| **EventIncident** | `tb_event_incidents` | ตารางเชื่อม (Join table) ผูก Incident ย่อยเข้ากับ Event ใหญ่ |
| **ChatMessage** | `tb_chat_messages` | ข้อความใน Event Room (id, event_id, user_id, message, created_at) |
| **FollowedArea** | `tb_followed_areas` | พื้นที่ หรือ Event ที่ผู้ใช้กดติดตาม (id, user_id, event_id, geometry) |
| **Notification** | `tb_notifications` | แจ้งเตือนของผู้ใช้ (id, user_id, type, message, read_at) |

---

## 5. แนวทางการปรับแก้โครงสร้างฐานข้อมูล (Schema Modification & Migration)

เมื่อต้องการเพิ่มคอลัมน์ (Column) หรือแก้ไขโครงสร้างตารางเดิมในระบบที่มีข้อมูลอยู่แล้ว **ห้ามลบตารางทิ้ง (`DROP TABLE`)** ให้ใช้แนวทางดังต่อไปนี้:

### 5.1 การเขียนคำสั่ง SQL (`ALTER TABLE`)

ใช้คำสั่ง `ALTER TABLE` พร้อมเงื่อนไข `IF NOT EXISTS` เพื่อป้องกันข้อผิดพลาด:

```sql
-- ตัวอย่าง: เพิ่มคอลัมน์ในตาราง users โดยไม่ลบตารางและไม่กระทบข้อมูลเดิม
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile TEXT;
```

### 5.2 การสร้างไฟล์ Script และวิธีรัน (Migration Runner)

ในโปรเจกต์นี้ แนะนำให้สร้างไฟล์ Migration Script ด้วย Node.js (เชื่อมต่อผ่าน `pg` Pool ที่มีอยู่แล้ว):

1. **สร้างไฟล์:** `backend/db/migrate.js`
   ```javascript
   require('dotenv').config();
   const { pool } = require('./db');

   async function runMigration() {
       const client = await pool.connect();
       try {
           console.log('⏳ กำลังรัน Migration...');
           
           // ใส่คำสั่ง SQL ที่ต้องการปรับปรุงโครงสร้าง
           const sql = `
               ALTER TABLE users 
               ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
               ADD COLUMN IF NOT EXISTS profile TEXT;
           `;

           await client.query(sql);
           console.log('✅ ปรับปรุงโครงสร้างฐานข้อมูลสำเร็จ (Migration Succeeded)!');
       } catch (err) {
           console.error('❌ เกิดข้อผิดพลาด:', err.message);
       } finally {
           client.release();
           await pool.end();
       }
   }

   runMigration();
   ```

2. **คำสั่งสำหรับรัน:**
   ```bash
   cd backend
   node db/migrate.js
   ```

### 5.3 ข้อตกลงที่ต้องทำควบคู่กัน (Checklist)

* [ ] รันคำสั่ง `ALTER TABLE` เพื่ออัปเดต Database จริง
* [ ] อัปเดตไฟล์ `backend/db/schema.sql` ให้มีฟิลด์ใหม่ (รักษา Source of Truth)
* [ ] อัปเดตเอกสาร `docs/05_Database_Design.md` ในตาราง Core Entities ให้มีฟิลด์ใหม่ตรงกัน
