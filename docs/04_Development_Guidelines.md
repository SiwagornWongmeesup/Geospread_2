# 04 — แนวทางการพัฒนา (Development Guidelines)

> **วัตถุประสงค์ของเอกสาร:** กำหนดมาตรฐานการเขียนโค้ด รูปแบบสถาปัตยกรรม กฎการใช้ Git ความปลอดภัย และการเขียนเอกสาร ที่นักพัฒนาทุกคน (รวมถึง AI) ต้องปฏิบัติตามอย่างเคร่งครัด

---

## สารบัญ

1. [โครงสร้างโค้ด (Code Structure)](#1-โครงสร้างโค้ด-code-structure)
2. [มาตรฐานคุณภาพโค้ด (Code Quality Standards)](#2-มาตรฐานคุณภาพโค้ด-code-quality-standards)
3. [ขอบเขตการทำงาน (Project Boundaries)](#3-ขอบเขตการทำงาน-project-boundaries)
4. [การใช้ Git (Git Workflow)](#4-การใช้-git-git-workflow)
5. [ความปลอดภัย (Security Rules)](#5-ความปลอดภัย-security-rules)

---

## 1. โครงสร้างโค้ด (Code Structure)

- **Frontend:** ใช้ TypeScript เป็นหลัก (Nuxt 4 / Vue)
- **Backend:** ใช้ JavaScript (Express.js)
- **Layer Separation:** 
  - Frontend: Component ห้ามมีตรรกะทางธุรกิจซับซ้อน ให้เรียกใช้ผ่าน Composables / Services
  - Backend: ต้องแยกการทำงานเป็น Controller → Service → Repository เสมอ
    - **Controller**: มีหน้าที่รับ Request, ตรวจสอบ (Validate) ข้อมูลเบื้องต้น และส่ง Response กลับเท่านั้น **ห้ามเขียน Business Logic ใน Controller โดยเด็ดขาด**
    - **Service (Business Layer)**: เป็นที่อยู่ของ **Business Logic** หรือตรรกะทางธุรกิจทั้งหมด การทำงานที่ซับซ้อนต้องอยู่ในชั้นนี้
    - **Repository**: รับผิดชอบการติดต่อกับ Database หรือ External Services

## 2. มาตรฐานคุณภาพโค้ด (Code Quality Standards)

ก่อนจะ Commit หรือ Merge โค้ด ต้องผ่านเกณฑ์ต่อไปนี้เสมอ:
- [ ] ไม่มีข้อผิดพลาดจาก TypeScript (`tsc --noEmit`)
- [ ] ไม่มีข้อผิดพลาดหรือคำเตือนจาก ESLint
- [ ] ไม่มีตัวแปรหรือ Imports ที่ไม่ได้ใช้งาน (Unused variables/imports)
- [ ] ใช้ชื่อไฟล์ ตัวแปร และฟังก์ชันที่เป็น **ภาษาอังกฤษ** และสื่อความหมายชัดเจน

## 3. ขอบเขตการทำงาน (Project Boundaries)

> กฎเหล่านี้รวมถึงผู้ช่วย AI ด้วย

- **ห้าม** แก้ไข Schema ของ Database สุ่มสี่สุ่มห้าโดยไม่ปรึกษาหรือไม่มีการอนุมัติ (ใช้ raw `schema.sql` ในการออกแบบโครงสร้าง)
- **ห้าม** ลบไฟล์สำคัญ หรือจัดระเบียบโปรเจกต์ขนาดใหญ่โดยไม่มีแผนล่วงหน้า
- **ต้องถามก่อนเสมอ** หากไม่แน่ใจในความต้องการของระบบ

## 4. การใช้ Git (Git Workflow)

ข้อความ Commit ต้องเป็นไปตามมาตรฐาน **Conventional Commits**:
- `feat:` เพิ่มฟีเจอร์ใหม่
- `fix:` แก้ไขบั๊ก
- `refactor:` จัดโครงสร้างโค้ดใหม่แต่ยังทำงานเหมือนเดิม
- `docs:` แก้ไขเอกสารเท่านั้น
- `style:` ปรับ Format โค้ด
- `test:` เพิ่ม/แก้ไขเทสต์

*ตัวอย่าง: `feat: add realtime chat in event room`*

## 5. ความปลอดภัย (Security Rules)

- **ห้ามใส่ API Keys, Token หรือ Password** ลงในซอร์สโค้ดโดยเด็ดขาด 
- ต้องใช้ Environment Variables (ไฟล์ `.env`) และใส่ `.env` ไว้ใน `.gitignore` เสมอ
