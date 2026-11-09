---
target: UI แอดมิน โปรไฟล์ ตั้งค่า — จุดที่เหมือน AI ทำ
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\User\\Project\\Geospread\\frontend\\app\\pages"
timestamp: 2026-11-08T00-23-21Z
slug: frontend-app-pages
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | KPI และ "สถานะระบบ ออนไลน์" บน /admin เป็นตัวเลขปลอม ไม่บอกสถานะจริง |
| 2 | Match System / Real World | 2 | ภาษาไทยดี แต่คำทักทาย+คำคมไม่เข้ากับหน้าทำงาน |
| 3 | User Control and Freedom | 2 | ปุ่มระงับ/จำกัดบัญชีไม่มีการยืนยัน (ยังเป็นตัวอย่าง) |
| 4 | Consistency and Standards | 1 | 3 ระบบสีต่อกัน, 2 ฟอนต์, คะแนน 0–10 กับ 0–100 |
| 5 | Error Prevention | 2 | ปุ่มอันตรายวางเท่ากับปุ่มเฝ้าระวัง |
| 6 | Recognition Rather Than Recall | 3 | ป้ายชัด ตัวกรองมองเห็น |
| 7 | Flexibility and Efficiency | 1 | ไม่มีเรียงคอลัมน์ / เลือกหลายคน / ตัวกรองไม่จำใน URL |
| 8 | Aesthetic and Minimalist Design | 1 | ไอคอนทุกหัวข้อ แถวการ์ดสถิติ แถบตัวอย่าง คำอธิบายซ้ำ |
| 9 | Error Recovery | 3 | หน้าผู้ใช้มี error/ไม่มีสิทธิ์/ลองอีกครั้ง |
| 10 | Help and Documentation | 2 | คำอธิบายเยอะเกินที่ไม่จำเป็น แต่ไม่บอกว่าคะแนนมาจากอะไร |
| **Total** | | **18/40** | **Poor** |

## Design Specificity Verdict
หน้าแอดมินดูเป็นเทมเพลต SaaS ทั่วไป ฝั่ง user (sidebar, พื้นกระดาษ, Plex, น้ำเงินหมึก) มีตัวตน แต่ /admin เป็นสูตร AI: คำทักทาย → คำคม → แถบตัวอย่าง → การ์ดสถิติ 6 ใบ + ↑% → แผนที่ → กราฟ → โดนัท → สถานะระบบเขียวหมด → งานด่วน → 2 ตาราง → การ์ดชุมชน 4 ใบ ทุกหน้าซ้ำโครงเดียวกัน และมี 3 ภาษาภาพต่อกัน: token ของ user, CSS ฟ้าแบบ Bootstrap ใน AdminDashboard, ม่วงคราม #4267ed ใน AdminUsersTrust
Detector: CLI พบ 1 (layout-transition ProfileSummary.vue:252) | overlay บนเบราว์เซอร์: /admin ~120 จุด (ตัวหนังสือเล็ก 8.5–11px ~90, contrast ต่ำ 22), /admin/users 15, /profile 2 (flat-type-hierarchy, transition), /settings 0

## Priority Issues
- [P0] ตัวเลขปลอมและสถานะระบบเขียวตลอดบน /admin แสดงเหมือนข้อมูลจริง → ตัดการ์ดปลอม/สถานะระบบ/คำคม/ปุ่มงานด่วนที่ไม่ทำงาน แล้วเริ่มหน้าด้วยคิวที่ต้องทำจริง (distill, clarify)
- [P1] ระบบภาพแตกเป็น 3 ชุด: :global(body) ใน AdminDashboard บังคับ system-ui/#f5f9ff/#102968, AdminUsersTrust ใช้ #4267ed; hex ~99/~105 ค่า, CSS sidebar ที่ตายแล้ว → ลบ global, ใช้ --gs-* (audit, polish)
- [P1] ข้อมูลส่วนตัว/ความปลอดภัยปลอมบน /profile (เบอร์, คะแนน 82, อีเมลยืนยันแล้ว, เข้าสู่ระบบ 09:42) และ admin ใช้โปรไฟล์ของพลเมือง (กิจกรรม, บ้านพ่อแม่) → empty state จริง, โปรไฟล์แอดมินแยก (harden, clarify)
- [P2] ตัวหนังสือเล็กเกินอ่านในแสงจ้า/ภาวะกดดัน: td 9.44px, th 8.8px, badge 8.48px, ปุ่ม 10.4px; contrast badge 3.1–3.9:1 → ขั้นต่ำ 14px ในตาราง (typeset)
- [P2] คะแนนความน่าเชื่อถือไม่แยกคน (ทุกคน 100 ทั้งที่ไม่เคยรายงาน) และปุ่มอันตรายแบน → สถานะ "ยังไม่มีคะแนน", เรียงตามความเสี่ยง, แยกปุ่มระงับ+ยืนยัน (shape, harden)

## Persona Red Flags
Alex (แอดมินใช้หนัก): ไม่มีเรียงคอลัมน์ ตัวกรองไม่อยู่ใน URL ไม่มีเลือกหลายคน ชื่อหน้าซ้ำใน topbar+H1 เมนูตาย 5 อัน ปุ่ม "ดูทั้งหมด" ส่วนใหญ่ขึ้น toast
Sam (screen reader/คีย์บอร์ด): แถวตารางเป็น tr tabindex=0 ไม่มี role/ชื่อ การเลือกไม่ประกาศ; ตัวกรองใช้ role=tab แต่ไม่มี tabpanel/ลูกศร; แท็บโปรไฟล์ไม่มี aria-selected; ตารางแดชบอร์ดไม่มี scope; โดนัทใช้สีอย่างเดียว
Casey (มือถือ): /profile สูง 2,459px ที่ 375px; การ์ดพื้นที่ติดตามซ้ำกับเมนู "พื้นที่ของฉัน"; ปุ่ม "ดูเหตุการณ์ทั้งหมด"/"จัดการพื้นที่" สูง 21px, "แก้ไข" 38px; มือถือ /admin 557px แรกเป็นคำทักทาย+การ์ดปลอม

## Minor Observations
- หน้าตั้งค่า 1440px วาง 2 คอลัมน์พอดีจอ เมนูหมวดด้านซ้ายจึงเกินจำเป็น
- "ลบบัญชี (กำลังพัฒนา)" ปุ่มปิดไว้; เมนู sidebar กำลังพัฒนา 5 อัน; badge 3 ตายตัว
- คำอธิบายใน SettingRow 12 อันบางอันพูดซ้ำป้าย ("ภาษา: ภาษาที่ใช้แสดงทั้งแอป")
- ข้อมูลตารางแดชบอร์ดเรียบร้อยผิดธรรมชาติ (5 เหตุ, เวลา 28 นาที/1/2/3/5 ชม., เชียงใหม่หมด) ขณะที่แผนที่ข้างๆ เป็นข้อมูลจริง
- /admin/users ขึ้น 0 คน "0%" ก่อนโหลดเสร็จ ไม่มี skeleton
- แถบคะแนนใช้ transition: width (ใช้ transform: scaleX แทน)

## Questions to Consider
- ถ้าลบการ์ดสถิติทุกใบบน /admin แอดมินจะเสียอะไรจริงๆ?
- ทำไมผู้ดูแลระบบถึงมี "บ้านพ่อแม่" เป็นพื้นที่ติดตาม?
- ควรมีคะแนนความน่าเชื่อถือใน UI ก่อนที่ข้อมูลจะพอให้คะแนนต่างกันไหม?
