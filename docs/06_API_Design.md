# 06 — การออกแบบ API (API Design)

> **วัตถุประสงค์ของเอกสาร:** กำหนดรูปแบบของ API (API conventions), รูปแบบการตอบสนองที่เป็นมาตรฐาน (standard response format), กลยุทธ์การยืนยันตัวตน (authentication strategy), และรูปแบบสถาปัตยกรรมสำหรับแบ็กเอนด์ของ GeoSpread ส่วน Endpoint ย่อยต่างๆ จะถูกจัดทำเอกสารไว้ที่นี่เมื่อมีการออกแบบและพัฒนาแล้ว

---

## สารบัญ

1. [ภาพรวม API (API Overview)](#1-ภาพรวม-api-api-overview)
2. [การยืนยันตัวตน (Authentication)](#2-การยืนยันตัวตน-authentication)
3. [รูปแบบการตอบสนองมาตรฐาน (Standard Response Format)](#3-รูปแบบการตอบสนองมาตรฐาน-standard-response-format)
4. [การจัดการข้อผิดพลาด (Error Handling)](#4-การจัดการข้อผิดพลาด-error-handling)
5. [การตรวจสอบข้อมูลคำขอ (Request Validation)](#5-การตรวจสอบข้อมูลคำขอ-request-validation)
6. [สถาปัตยกรรมโค้ด (Code Architecture)](#6-สถาปัตยกรรมโค้ด-code-architecture)
7. [อ้างอิง Endpoint (Endpoint Reference)](#7-อ้างอิง-endpoint-endpoint-reference)
8. [คำถามที่เปิดกว้าง / งานที่ต้องทำ (Open Questions / TODO)](#8-คำถามที่เปิดกว้าง--งานที่ต้องทำ-open-questions--todo)

---

## 1. ภาพรวม API (API Overview)

| คุณสมบัติ | ค่าที่ตั้งไว้ |
|----------|-------|
| **โปรโตคอล** | REST over HTTPS (พร้อมรองรับ WebSocket สำหรับฟีเจอร์ Chat/Event Room) |
| **รูปแบบข้อมูล** | JSON |
| **การยืนยันตัวตน** | JWT (Bearer token) |
| **Base URL (Production)** | TODO: กำหนดหลังจากการ deploy |
| **Base URL (Development)** | TODO: กำหนด (เช่น `http://localhost:3001/api/v1`) |
| **การจัดเวอร์ชัน (Versioning)** | TODO: กำหนดกลยุทธ์ (เช่น การใช้พาธ `/api/v1/`) |

---

## 2. การยืนยันตัวตน (Authentication)

GeoSpread ใช้ **JSON Web Tokens (JWT)** สำหรับการยืนยันตัวตนแบบไร้สถานะ (stateless authentication)

| คุณสมบัติ | รายละเอียด |
|----------|--------|
| **ประเภท Token** | Bearer token |
| **ตำแหน่ง Token** | `Authorization: Bearer <token>` ใน request header |
| **วันหมดอายุ Token** | TODO: กำหนดอายุของ access token และกลยุทธ์ refresh token |
| **Refresh tokens** | TODO: กำหนดว่าจะใช้งาน refresh tokens หรือไม่ |

### Endpoints ที่มีการป้องกัน vs. สาธารณะ

> TODO: กำหนดว่า endpoints ใดที่เปิดสาธารณะ (ไม่ต้องใช้ auth) และใดที่ต้องการ JWT ที่ถูกต้อง

---

## 3. รูปแบบการตอบสนองมาตรฐาน (Standard Response Format)

**ทุก** การตอบสนองของ API — ทั้งสำเร็จและผิดพลาด — จะต้องใช้โครงสร้างนี้:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {}
}
```

| ฟิลด์ | ประเภท | คำอธิบาย |
|-------|------|-------------|
| `success` | `boolean` | `true` สำหรับการทำงานที่สำเร็จ, `false` สำหรับกรณีเกิดข้อผิดพลาด |
| `message` | `string` | สถานะหรือคำอธิบายข้อผิดพลาดที่อ่านเข้าใจง่าย |
| `data` | `object \| array \| null` | ข้อมูล (Payload); ใช้ `null` หรือละเว้นฟิลด์นี้หากเกิดข้อผิดพลาดหรือไม่มีข้อมูลตอบกลับ |

### ตัวอย่างเมื่อสำเร็จ (Success Example)

```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "type": "Earthquake",
    "severity": "High",
    "location": { "lat": 13.7563, "lng": 100.5018 },
    "createdAt": "2026-07-14T10:00:00Z"
  }
}
```

### ตัวอย่างเมื่อผิดพลาด (Error Example)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "id",
      "message": "User ID must be a valid positive integer"
    }
  ]
}
```

---

## 4. การจัดการข้อผิดพลาด (Error Handling)

| HTTP Status | ความหมาย | เมื่อใดที่ควรใช้ |
|-------------|---------|-------------|
| `200 OK` | สำเร็จ | ทำ GET, PUT, PATCH สำเร็จ |
| `201 Created` | สร้างทรัพยากรสำเร็จ | ทำ POST เพื่อสร้างรายการใหม่สำเร็จ |
| `400 Bad Request` | ตรวจสอบข้อมูลไม่ผ่าน | พารามิเตอร์ของคำขอสูญหายหรือไม่ถูกต้อง |
| `401 Unauthorized` | ไม่ได้ยืนยันตัวตน | JWT สูญหายหรือไม่ถูกต้อง |
| `403 Forbidden` | ไม่มีสิทธิ์เข้าถึง | ยืนยันตัวตนแล้วแต่มีสิทธิ์ (Permission) ไม่เพียงพอ |
| `404 Not Found` | ไม่พบทรัพยากร | สิ่งที่ร้องขอไม่มีอยู่ |
| `409 Conflict` | ความขัดแย้ง | ทรัพยากรซ้ำซ้อนหรือสถานะขัดแย้งกัน |
| `422 Unprocessable Entity` | ข้อผิดพลาดเชิงตรรกะธุรกิจ | โครงสร้างคำขอถูกต้องแต่ไม่ผ่านกฎทางธุรกิจ |
| `500 Internal Server Error` | ข้อผิดพลาดจากเซิร์ฟเวอร์ | เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์ที่ไม่คาดคิด |

> การตอบสนองที่เป็นข้อผิดพลาดทั้งหมดต้องใช้ [รูปแบบการตอบสนองมาตรฐาน](#3-รูปแบบการตอบสนองมาตรฐาน-standard-response-format) โดยกำหนดให้ `"success": false`

---

## 5. การตรวจสอบข้อมูลคำขอ (Request Validation)

ทุกคำขอที่เข้ามาจะต้องได้รับการตรวจสอบความถูกต้อง (validated) **ก่อน** ไปถึงเลเยอร์ Service

| กฎ | รายละเอียด |
|------|--------|
| **ตรวจสอบอินพุตทั้งหมด** | Query parameters, path parameters และ request bodies จะต้องถูกตรวจสอบทั้งหมด |
| **Fail fast** | ตอบกลับ `400 Bad Request` พร้อมข้อความแจ้งข้อผิดพลาดที่ชัดเจนทันทีเมื่อการตรวจสอบล้มเหลว |
| **ไลบรารีการตรวจสอบ** | ใช้ `express-validator` ร่วมกับ custom middleware `validateRequest` |

---

## 6. สถาปัตยกรรมโค้ด (Code Architecture)

แบ็กเอนด์ใช้ **สถาปัตยกรรมแบบสามชั้น (Three-layer architecture)** ที่เคร่งครัด:

```
HTTP Request
    ↓
Controller   — รับคำขอ, ตรวจสอบข้อมูลอินพุต, ส่งต่อไปยัง service, ส่งคืนการตอบสนอง
    ↓
Service      — ตรรกะของระบบ การตรวจสอบเงื่อนไข
    ↓
Repository   — ส่วนครอบการคิวรีฐานข้อมูลด้วย Raw SQL
    ↓
Database (PostgreSQL + PostGIS)
```

### ความรับผิดชอบของแต่ละชั้น (Layer Responsibilities)

| เลเยอร์ | รูปแบบไฟล์ | ความรับผิดชอบ |
|-------|----------------|---------------|
| **Controller** | `*.controller.ts` | ตรวจสอบอินพุต, ส่งต่องานไปยัง service, จัดรูปแบบการตอบสนอง |
| **Service** | `*.service.ts` | ฟังก์ชันที่มีตรรกะทางธุรกิจ (เรียกใช้จาก Controller) |
| **Repository** | `*.repository.ts` | ห่อหุ้มคำสั่ง SQL (Database Queries) |

---

## 7. อ้างอิง Endpoint (Endpoint Reference)

> **หมายเหตุ:** ข้อกำหนดของ Endpoint ของ API ยังไม่ถูกกำหนดอย่างสมบูรณ์ Endpoints ต้องได้รับการออกแบบตามข้อกำหนดของผลิตภัณฑ์และจัดทำเอกสารไว้ที่นี่ก่อนทำการโค้ดดิ้ง

> TODO: กำหนด Endpoints ทั้งหมดสำหรับส่วนต่างๆ ดังนี้:

### การยืนยันตัวตน (Authentication)

| Method | Path | คำอธิบาย | จำเป็นต้องยืนยันตัวตน |
|--------|------|-------------|---------------|
| POST | `/auth/register` | สมัครผู้ใช้งานใหม่ | ไม่ |
| POST | `/auth/login` | เข้าสู่ระบบและรับ JWT | ไม่ |
| POST | `/auth/logout` | ยกเลิกเซสชัน | ใช่ |
| POST | `/auth/refresh` | รีเฟรช access token | — |

---

### เหตุการณ์ย่อย และเหตุการณ์หลัก (Incidents & Events)

> หมายเหตุ: อิงตามแนวคิดใหม่ Incident คือรายงานเดี่ยวๆ ส่วน Event คือศูนย์รวมเหตุการณ์หลัก

| Method | Path | คำอธิบาย | จำเป็นต้องยืนยันตัวตน |
|--------|------|-------------|---------------|
| GET | `/incidents` | ดึงรายการ Incident ตามพื้นที่หรือรัศมีระยะทาง | — |
| POST | `/incidents` | สร้างรายงาน Incident จากข้อความอิสระ พร้อมตำแหน่ง; category และ severity ต้องไม่เป็นข้อมูลบังคับจากผู้ใช้ ตอบกลับ `report_id`, `incident_id` (เหตุการณ์ที่รายงานถูกรวมเข้าไป หรือ `null` ถ้ายังเป็นรายงานเดี่ยว), `status`, `created_at` | ใช่ |

> สัญญา request/response ฉบับจริงต้องรองรับ `reportedObservation`, `suggestedCategory`, `customReportType`, `credibility`, `severity`, `mapDisplayMode` และ `impactRadius` ตาม [13_Incident_Reporting_Concept.md](./13_Incident_Reporting_Concept.md) ก่อนนำ endpoint นี้ไป implement ใหม่
| GET | `/events` | ดึงรายการ Event ศูนย์กลางเหตุการณ์สำคัญ | — |
| GET | `/events/:id` | ดึงรายละเอียด Event เดียว (Overview, Timeline) | — |
| POST | `/admin/events` | (Admin) สร้าง Event ใหม่ หรือรวม Incidents เป็น Event | ใช่ (Admin) |

---

### ห้องเหตุการณ์เฉพาะกิจ และแชท (Event Rooms & Chat)

> หมายเหตุ: ในส่วนนี้ API อาจจะใช้ร่วมกับการเชื่อมต่อ WebSocket (เช่น `/ws/events/:id/chat`) เพื่อความเรียลไทม์

| Method | Path | คำอธิบาย | จำเป็นต้องยืนยันตัวตน |
|--------|------|-------------|---------------|
| POST | `/events/:id/chat` | ส่งข้อความแชทเข้าไปใน Event Room | ใช่ |
| GET | `/events/:id/chat` | ดึงประวัติการแชทใน Event Room | ใช่ |
| POST | `/events/:id/follow` | กดติดตาม (Follow) เพื่อเข้าร่วมและรับการแจ้งเตือนจาก Event | ใช่ |

---

### การขอความช่วยเหลือ (Help Requests)

| Method | Path | คำอธิบาย | จำเป็นต้องยืนยันตัวตน |
|--------|------|-------------|---------------|
| POST | `/help-requests` | ส่งคำขอความช่วยเหลือ — `multipart/form-data`: `help_type`, `custom_help_type` (เมื่อเป็น other), `description`, `people_count`, `lat`, `lng`, `location_source` และรูปในช่อง `media` (JPG/PNG สูงสุด 5 รูป รูปละไม่เกิน 20 MB) | ใช่ |
| GET | `/help-requests/map` | คำขอที่ยังไม่หมดอายุ สถานะ `pending` (รอความช่วยเหลือ) และ `accepted` (มีผู้ช่วยแล้ว) สำหรับหมุดบนแผนที่ มี `request_status`, `offer_count` และ**พิกัดคร่าวๆ** (ปัดลงตาราง 0.005° ราว 500 ม.) | — |
| GET | `/help-requests/mine` | คำขอของฉัน + คำขอที่ฉันเสนอช่วย ทุกสถานะ (การ์ด "ความช่วยเหลือของฉัน" ในหน้าโปรไฟล์) | ใช่ |
| GET | `/help-requests/:id` | รายละเอียดเต็มของคำขอ ข้อมูลที่ได้ขึ้นกับคนที่เปิดดู (ดูด้านล่าง) | ไม่บังคับ |
| POST | `/help-requests/:id/offers` | เสนอช่วยเหลือ `{ message? }` (ไม่เกิน 500 ตัว) | ใช่ |
| PATCH | `/help-requests/:id/offers/:offerId` | เจ้าของคำขอรับ/ปฏิเสธ `{ action: 'accept' \| 'decline', share_phone?, share_line? }` หรือผู้ช่วยถอนข้อเสนอของตัวเอง `{ action: 'withdraw' }` | ใช่ |
| PATCH | `/help-requests/:id/status` | เจ้าของเปลี่ยนสถานะ `{ action: 'resolve' \| 'cancel' \| 'release_helper' }` | ใช่ (เจ้าของคำขอ) |
| POST | `/help-requests/:id/reports` | รายงานผู้ใช้ที่น่าสงสัย `{ offer_id?, reason, details? }` | ใช่ |

วงจรสถานะของคำขอ:

```
pending ──เจ้าของรับข้อเสนอ──▶ accepted ──resolve──▶ resolved
   │                            ├─release_helper / ผู้ช่วย withdraw──▶ pending (ต่ออายุ 24 ชม.)
   └──────────── cancel (ได้ทั้ง pending และ accepted) ──────────▶ cancelled
```

#### `GET /help-requests/:id` — รายละเอียดคำขอ

- ไม่ต้องล็อกอินก็เปิดได้ ถ้าส่ง `Authorization: Bearer <token>` มาด้วย จะได้ข้อมูลตามสิทธิ์
- ไม่ส่ง `user_id`, `accepted_by` และเบอร์ / LINE ดิบของผู้ขอออกไป
- **พิกัด:** เจ้าของและผู้ช่วยที่ได้รับเลือกได้พิกัดจริง คนอื่นได้พิกัดคร่าวๆ พร้อม `location_is_approximate: true`
- `offers` ส่งให้เฉพาะเจ้าของคำขอ (คนอื่นได้ `null`) แต่ละข้อเสนอมี:
  - `helper_since` (วันที่สมัครสมาชิก)
  - `helped_count` (จำนวนคำขอที่ปิดเป็น `resolved` โดยมีคนนี้เป็นผู้ช่วย)
  - `is_reported` (เจ้าของเคยรายงานคนนี้ในคำขอนี้แล้วหรือยัง)
  - `contact` = `{ phone, line_id }` จากโปรไฟล์ผู้ช่วย เฉพาะข้อเสนอที่รับแล้ว
- `contact` = `{ name, phone, line_id }` ของผู้ขอ ส่งให้เฉพาะผู้ช่วยที่ได้รับเลือก และมีเฉพาะช่องที่ผู้ขอเลือกแชร์ไว้ (`share_phone`, `share_line`)
- `viewer`:
  - `can_report_requester`: เคยเสนอช่วยคำขอนี้และยังไม่เคยรายงานผู้ขอ
  - `my_contact`: เฉพาะเจ้าของ บอกว่าโปรไฟล์มีเบอร์ / LINE ไหม ใช้เปิดช่องติ๊กตอนรับข้อเสนอ
- ไม่พบคำขอ → 404

```json
{
  "success": true,
  "data": {
    "help_request_id": 13,
    "help_type": "food",
    "custom_help_type": null,
    "description": "ติดอยู่ในบ้าน น้ำท่วมสูง ไม่มีอาหาร",
    "people_count": 3,
    "lat": 13.755,
    "lng": 100.5,
    "location_is_approximate": true,
    "request_status": "accepted",
    "accepted_at": "2026-11-09T12:20:00.000Z",
    "resolved_at": null,
    "cancelled_at": null,
    "share_phone": false,
    "share_line": true,
    "expires_at": "2026-11-10T12:20:00.000Z",
    "is_expired": false,
    "created_at": "2026-11-09T12:00:00.000Z",
    "requester_name": "สมชาย ใจดี",
    "offer_count": 2,
    "media": [{ "media_id": 1, "media_type": "image", "media_url": "https://res.cloudinary.com/…", "created_at": "…" }],
    "offers": null,
    "contact": null,
    "viewer": {
      "is_logged_in": true,
      "is_owner": false,
      "is_accepted_helper": false,
      "my_offer": { "offer_id": 5, "offer_status": "declined", "message": "มีรถกระบะ", "created_at": "…" },
      "can_offer": false,
      "can_report_requester": true,
      "my_contact": null
    }
  }
}
```

#### `GET /help-requests/mine` — ความช่วยเหลือของฉัน

- `requested`: คำขอที่ฉันส่ง (สูงสุด 50 รายการล่าสุด) มี `request_status`, `is_expired`, `offer_count`
- `offered`: คำขอที่ฉันเสนอช่วย พร้อม `offer_id`, `offer_status`, `offered_at` ของข้อเสนอของฉัน

#### `POST /help-requests/:id/offers` — เสนอช่วยเหลือ

- เสนอคำขอของตัวเอง → 400
- คำขอไม่ได้อยู่ในสถานะรอความช่วยเหลือ หรือหมดอายุแล้ว → 409
- เสนอซ้ำ (1 คนเสนอได้ครั้งเดียวต่อคำขอ รวมถึงคนที่ถอนตัวหรือถูกปลดแล้ว) → 409
- สำเร็จ → 201 พร้อมข้อเสนอที่สร้าง

#### `PATCH /help-requests/:id/offers/:offerId` — รับ/ปฏิเสธ/ถอนข้อเสนอ

- `accept` (เจ้าของ):
  - ต้องส่ง `share_phone` และ/หรือ `share_line` เป็น `true` อย่างน้อย 1 ช่อง และช่องนั้นต้องมีในโปรไฟล์ ไม่งั้นได้ 400
  - ผลลัพธ์: ข้อเสนอนี้เป็น `accepted`, ข้อเสนออื่นที่รอตอบเป็น `declined`
  - คำขอเป็น `accepted` (บันทึก `accepted_by`, `accepted_at`) และต่ออายุอย่างน้อย 24 ชม.
- `decline` (เจ้าของ): ข้อเสนอนี้เป็น `declined`
- `withdraw` (ผู้ช่วยเจ้าของข้อเสนอ):
  - ข้อเสนอเป็น `withdrawn`
  - ถ้าเป็นผู้ช่วยที่ได้รับเลือกอยู่ คำขอจะกลับเป็น `pending` และต่ออายุ 24 ชม.
- error:
  - ไม่ใช่เจ้าของคำขอ (`accept` / `decline`) หรือไม่ใช่เจ้าของข้อเสนอ (`withdraw`) → 403
  - ข้อเสนอไม่ได้อยู่ในสถานะที่ทำได้ → 409
- ตอบกลับรายละเอียดล่าสุดในรูปแบบเดียวกับ `GET /help-requests/:id`

#### `PATCH /help-requests/:id/status` — เจ้าของเปลี่ยนสถานะคำขอ

- `resolve`: ได้รับความช่วยเหลือแล้ว ต้องเป็น `accepted` อยู่ → `resolved` (บันทึก `resolved_at`)
- `release_helper`: ผู้ช่วยไม่มาหรือขอเปลี่ยนผู้ช่วย ต้องเป็น `accepted` อยู่
  - ข้อเสนอที่รับไว้เป็น `released`
  - คำขอกลับเป็น `pending` ต่ออายุ 24 ชม. และล้าง `share_phone` / `share_line`
- `cancel`: ได้ทั้ง `pending` และ `accepted` → `cancelled` (บันทึก `cancelled_at`) ข้อเสนอที่ยังรอเป็น `declined`
- error:
  - ไม่ใช่เจ้าของ → 403
  - สถานะไม่ตรงเงื่อนไข → 409
- ทุกครั้งที่สถานะเปลี่ยน บันทึกลง `tb_help_request_updates`
- ตอบกลับรายละเอียดล่าสุดในรูปแบบเดียวกับ `GET /help-requests/:id`

#### `POST /help-requests/:id/reports` — รายงานผู้ใช้

- `reason`: `asked_money` | `no_show` | `fake_request` | `harassment` | `other`, `details` ไม่บังคับ (≤ 500 ตัว)
- ส่ง `offer_id`: เจ้าของคำขอรายงานผู้ช่วยคนนั้น (ไม่ใช่เจ้าของ → 403)
- ไม่ส่ง `offer_id`: ผู้ที่เคยเสนอช่วยคำขอนี้รายงานผู้ขอ (ไม่เคยเสนอ → 403)
- รายงานคนเดิมในคำขอเดิมซ้ำ → 409
- สำเร็จ → 201 (เก็บใน `tb_user_reports` สถานะ `open` รอแอดมินตรวจ ยังไม่มีหน้าแอดมิน)

---

### พื้นที่ที่ติดตาม (Saved Locations / Followed Areas)

| Method | Path | คำอธิบาย | จำเป็นต้องยืนยันตัวตน |
|--------|------|-------------|---------------|
| GET | `/locations` | ดึงรายการสถานที่ (บ้าน, ที่ทำงาน) ที่ผู้ใช้บันทึกไว้ติดตาม | ใช่ |
| POST | `/locations` | บันทึกพื้นที่/สถานที่ใหม่ | ใช่ |
| DELETE | `/locations/:id` | ลบพื้นที่ที่ติดตาม | ใช่ |

---

### โปรไฟล์ผู้ใช้ (User Profile)

| Method | Path | คำอธิบาย | จำเป็นต้องยืนยันตัวตน |
|--------|------|-------------|---------------|
| GET | `/users/me` | ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน (ใช้ id จาก token เท่านั้น) พร้อมจำนวนรายงานของตัวเอง | ใช่ |
| PATCH | `/users/me` | แก้ข้อมูลส่วนตัว (ชื่อ นามสกุล เบอร์ LINE ID Instagram) ของผู้ใช้ปัจจุบัน แก้อีเมล/รหัสผ่าน/สิทธิ์ไม่ได้ | ใช่ |

#### `GET /users/me` — โปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่

- ต้องส่ง `Authorization: Bearer <token>` (ไม่มี token ได้ 401, ไม่พบผู้ใช้ได้ 404)
- ใช้ `id` จาก token เท่านั้น ผู้ใช้จึงดูได้แค่ข้อมูลของตัวเอง ไม่ส่งรหัสผ่านกลับมา

```json
{
  "success": true,
  "data": {
    "id": 19,
    "email": "user@example.com",
    "name": "สมชาย",
    "lastname": "ใจดี",
    "profile": null,
    "phone": "0812345678",
    "line_id": "somchai.j",
    "instagram": null,
    "role": "user",
    "trust_score": 100,
    "email_verified": true,
    "created_at": "2026-11-04T12:45:58.636Z",
    "report_count": 1,
    "verified_report_count": 0,
    "pending_report_count": 1,
    "rejected_report_count": 0
  }
}
```

#### `PATCH /users/me` — แก้ข้อมูลส่วนตัว

- ต้องส่ง `Authorization: Bearer <token>` ใช้ `id` จาก token เท่านั้น แก้บัญชีคนอื่นไม่ได้
- ส่งทุกช่องที่ต้องการเก็บ ช่องที่ส่งเป็นข้อความว่างหรือ `null` จะถูกล้างเป็น `null` (ยกเว้น `name` ที่บังคับกรอก)
- ตอบกลับโปรไฟล์ล่าสุดในรูปแบบเดียวกับ `GET /users/me`

| ช่อง | กฎ |
|---|---|
| `name` | บังคับ, ไม่เกิน 50 ตัวอักษร |
| `lastname` | ไม่บังคับ, ไม่เกิน 50 ตัวอักษร |
| `phone` | ไม่บังคับ, เบอร์ขึ้นต้นด้วย 0 ตัวเลข 9–10 หลัก (เว้นวรรค/ขีดได้) |
| `line_id` | ไม่บังคับ, ตัวอักษรอังกฤษ ตัวเลข `.` `_` `-` ยาว 4–20 ตัว |
| `instagram` | ไม่บังคับ, ตัวอักษรอังกฤษ ตัวเลข `.` `_` ไม่เกิน 30 ตัว (ใส่ `@` นำหน้ามาได้ ระบบตัดออกให้) |

```json
// Request
{ "name": "สมชาย", "lastname": "ใจดี", "phone": "0812345678", "line_id": "somchai.j", "instagram": "" }
```

ข้อมูลไม่ผ่านการตรวจได้ 400 พร้อม `errors: [{ field, message }]`

---

### การแจ้งเตือน (Notifications)

| Method | Path | คำอธิบาย | จำเป็นต้องยืนยันตัวตน |
|--------|------|-------------|---------------|
| GET | `/notifications` | ดึงรายการแจ้งเตือนของผู้ใช้ | ใช่ |
| PATCH | `/notifications/:id/read` | ทำเครื่องหมายว่าอ่านแล้ว | ใช่ |

---

### แอดมินและผู้ดูแล (Admin & Moderation)

| Method | Path | คำอธิบาย | จำเป็นต้องยืนยันตัวตน |
|--------|------|-------------|---------------|
| GET | `/incidents/admin/overview` | ข้อมูลสรุปสำหรับแดชบอร์ดผู้ดูแลระบบ (`/admin`): รายงานรอตรวจ เหตุที่ดำเนินอยู่ คำขอช่วยเหลือ ผู้ใช้ กราฟ 7 วัน และรายการล่าสุด | ใช่ (Admin) |
| GET | `/users` | ดึงรายชื่อผู้ใช้ทั้งหมดพร้อมสรุปการรายงาน สำหรับหน้าจัดการผู้ใช้ (`/admin/users`) | ใช่ (Admin) |
| GET | `/admin/reports` | ดึงรายการรายงานของชุมชนที่รอการตรวจสอบ (Verify) | ใช่ (Admin) |
| PATCH | `/admin/incidents/:id/verify`| อัปเดตสถานะการตรวจสอบความถูกต้องของ Incident | ใช่ (Admin) |
| PATCH | `/admin/incidents/:id/reject`| ปฏิเสธรายงานที่เป็นสแปมหรือเท็จ | ใช่ (Admin) |

#### `GET /incidents/admin/overview` — ข้อมูลสรุปแดชบอร์ดผู้ดูแลระบบ (เฉพาะ Admin)

- ต้องส่ง `Authorization: Bearer <token>` ของผู้ใช้ role `admin` (ไม่ใช่ admin ได้ 403)
- `daily_reports` มีครบทุกวันย้อนหลัง `trend_days` วัน (รวมวันนี้) วันที่ไม่มีรายงานได้ 0
- `reports_by_type` นับรายงานใน `type_days` วันล่าสุด ประเภทใช้ `final_type_id` ก่อน ถ้าไม่มีใช้ `user_selected_type_id`; `type_code = null` คือยังไม่ระบุประเภท
- `latest_reports` ไม่ส่งตำแหน่งของผู้รายงาน (Reporter Location เป็นข้อมูลภายใน)

```json
{
  "success": true,
  "data": {
    "summary": {
      "pending_reports": 8,
      "oldest_pending_at": "2026-10-29T03:29:57.839Z",
      "active_incidents": 7,
      "open_help_requests": 0,
      "total_users": 16,
      "new_users_7d": 5
    },
    "trend_days": 7,
    "daily_reports": [{ "day": "2026-11-06", "total": 2, "verified": 2, "pending": 0, "rejected": 0 }],
    "type_days": 30,
    "reports_by_type": [{ "type_code": "flood", "type_name": "น้ำท่วม", "total": 3 }],
    "latest_reports": [{ "report_id": 82, "incident_id": null, "description": "…", "report_status": "pending", "is_suspicious": false, "created_at": "2026-11-07T08:06:38.384Z", "type_code": null, "type_name": null }],
    "latest_help_requests": [{ "help_request_id": 5, "help_type": "food", "custom_help_type": null, "description": "…", "people_count": 3, "request_status": "pending", "created_at": "2026-11-05T06:10:11.659Z" }]
  }
}
```

#### `GET /users` — รายชื่อผู้ใช้ทั้งหมด (เฉพาะ Admin)

- ต้องส่ง `Authorization: Bearer <token>` ของผู้ใช้ role `admin` (ไม่ใช่ admin ได้ 403)
- เรียงผู้ใช้ที่สมัครล่าสุดขึ้นก่อน ไม่ส่งรหัสผ่านกลับมา
- ตัวเลขการรายงานนับจาก `tb_incident_reports` ของผู้ใช้คนนั้น (ผู้ที่ยังไม่เคยรายงานได้ 0)

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 19,
      "email": "user@example.com",
      "name": "สมชาย",
      "lastname": "ใจดี",
      "profile": null,
      "phone": "0812345678",
      "role": "user",
      "trust_score": 100,
      "email_verified": true,
      "created_at": "2026-11-04T12:45:58.636Z",
      "updated_at": "2026-11-04T12:45:58.636Z",
      "report_count": 1,
      "verified_report_count": 0,
      "rejected_report_count": 0,
      "suspicious_report_count": 0,
      "last_report_at": "2026-11-05T06:10:11.659Z"
    }
  ]
}
```

---

## 8. คำถามที่เปิดกว้าง / งานที่ต้องทำ (Open Questions / TODO)

| ลำดับ | คำถาม |
|---|----------|
| 1 | URL ฐานของ API (Base URL) และกลยุทธ์การแบ่งเวอร์ชันจะเป็นอย่างไร? |
| 2 | อายุของ access token (TTL) คือเท่าไร? และจะมีการใช้ refresh tokens หรือไม่? |
| 3 | ไลบรารีใดจะถูกนำมาใช้ตรวจสอบอินพุต (Zod, Joi, express-validator)? |
| 4 | Endpoint แบบลิสต์จะใช้ Pagination หรือไม่? ถ้าใช้ จะใช้แบบใด (cursor หรือ offset)? |
| 5 | การเชื่อมต่อสำหรับ Event Chat และ Real-time Map Updates จะใช้ WebSocket หรือ SSE หรือ Polling? |
| 6 | Rate limits ของการสร้างรายงานและส่งคำขอความช่วยเหลือจะตั้งไว้ที่ระดับใด? |
| 7 | อัปโหลดรูปภาพจะทำอย่างไร — ไคลเอนต์อัปโหลดไป Cloudinary โดยตรง หรือผ่านแบ็กเอนด์? |
| 8 | การยืนยันตัวตนของแอดมินใช้โครงสร้างแบบไหน — ใช้ JWT ตัวเดิมแต่เพิ่ม Role claim เข้าไป หรือใช้ระบบล็อกอินแอดมินแยกต่างหาก? |
