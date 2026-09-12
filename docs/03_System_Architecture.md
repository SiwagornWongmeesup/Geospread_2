# 03 — สถาปัตยกรรมระบบ (System Architecture)

> **วัตถุประสงค์ของเอกสาร:** อธิบายการออกแบบระบบโดยรวม การเลือกใช้เทคโนโลยี (technology stack) ขอบเขตของส่วนประกอบต่างๆ และรูปแบบการติดตั้ง (deployment topology) สำหรับ GeoSpread

---

## สารบัญ

1. [เทคโนโลยีที่ใช้ (Technology Stack)](#1-เทคโนโลยีที่ใช้-technology-stack)
2. [สถาปัตยกรรมระดับสูง (High-Level Architecture)](#2-สถาปัตยกรรมระดับสูง-high-level-architecture)
3. [รายละเอียดส่วนประกอบ (Component Breakdown)](#3-รายละเอียดส่วนประกอบ-component-breakdown)
4. [รูปแบบการติดตั้ง (Deployment Topology)](#4-รูปแบบการติดตั้ง-deployment-topology)

---

## 1. เทคโนโลยีที่ใช้ (Technology Stack)

### ฟรอนต์เอนด์ (Frontend)
- **Nuxt 4 + Vue 3:** เฟรมเวิร์กหลัก
- **JavaScript:** ภาษาหลักทั้ง Frontend และ Backend
- **Tailwind CSS:** จัดการสไตล์
- **Mapbox:** เรนเดอร์แผนที่

### แบ็กเอนด์ (Backend)
- **Express.js (Node.js):** เซิร์ฟเวอร์หลัก (Controller, Service, Repository)
- **Socket.io / WebSockets:** สำหรับระบบ Real-time (Chat ใน Event Room)
- **JWT:** ยืนยันตัวตน

### ฐานข้อมูล (Database)
- **PostgreSQL + PostGIS:** สำหรับการคิวรีเชิงพื้นที่ (รัศมีแผนที่, พิกัด)
- **Database Driver:** ใช้ Raw SQL ผ่านไลบรารี `pg` จัดการ Schema และข้อมูลทั้งหมด

### บริการภายนอก (Infrastructure & Services)
- **Cloudinary:** จัดเก็บรูปภาพ
- **Vercel (Frontend) / Render (Backend)**
- **Supabase / Neon:** ฐานข้อมูล Managed PostgreSQL

---

## 2. สถาปัตยกรรมระดับสูง (High-Level Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│              Nuxt 4 + Vue 3 + Tailwind CSS + Mapbox             │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WebSocket (Chat)
┌────────────────────────────▼────────────────────────────────────┐
│                     Backend (Express.js)                        │
│           REST API · WebSocket · JWT Auth                       │
│                Controller → Service → Repository                │
└──────────┬──────────────────┬───────────────────────────────────┘
           │                  │
  ┌────────▼──────┐   ┌───────▼────────────────────────────────┐
  │  PostgreSQL   │   │         Third-Party / AI Services      │
  │               │   │  Cloudinary (images) · Mapbox (tiles)  │
  └───────────────┘   │  AI Classifier                         │
                      └────────────────────────────────────────┘
```

---

## 3. รายละเอียดส่วนประกอบ (Component Breakdown)

- **Frontend:** ทำหน้าที่นำเสนอ (Presentation) ไม่มีตรรกะทางธุรกิจที่ซับซ้อน ดึงข้อมูลผ่าน Services/Composables
- **Backend (Layered):** 
  - *Controller:* รับรีเควสต์ ตรวจสอบข้อมูลเบื้องต้น และส่งกลับเรสปอนส์ (**ห้ามมี Business Logic**)
  - *Service (Business Layer):* ศูนย์รวมตรรกะทางธุรกิจ (Business Logic) ของระบบทั้งหมด (เช่น ผูก Incident เข้า Event, จัดการแชท, เงื่อนไขของระบบ)
  - *Repository:* ติดต่อฐานข้อมูล
- **Realtime Layer:** ใช้ WebSocket จัดการการส่งข้อความแชทใน Event Room ทันที

---

## 4. รูปแบบการติดตั้ง (Deployment Topology)

- **Frontend:** Vercel (Edge)
- **Backend:** Render (Web Service แบบ Always-on)
- **Database:** Supabase หรือ Neon (เปิดใช้งาน PostGIS)
- **Media:** Cloudinary
