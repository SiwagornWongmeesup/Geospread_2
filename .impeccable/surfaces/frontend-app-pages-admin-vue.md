---
version: 1
slug: "frontend-app-pages-admin-vue"
primary_target: "frontend/app/pages/admin.vue"
related_targets: []
---

# ผู้ดูแลระบบ /admin

โหมด: Operate

## Direction contract

THESIS: แดชบอร์ดผู้ดูแลระบบต้องทำให้ภาพรวมความปลอดภัยและคิวงานเร่งด่วนอ่านได้ในไม่กี่วินาที โดยคงการตรวจสอบรายงานจริงให้เข้าถึงได้จากเมนูเหตุการณ์และงานด่วน.

OWN-WORLD: ยึดภาพอ้างอิงของผู้ใช้—พื้นขาวอมฟ้า, สีน้ำเงิน GeoSpread, สถานะเขียว/เหลือง/แดง, ไอคอน SVG ที่มีในโปรเจกต์ และพื้นที่ข้อมูลที่เส้นแบ่งบาง อ่านได้ชัด.

STORY: Administrator เห็นข้อมูลตัวอย่างที่ติดป้ายชัดเพื่อประเมินโครงสร้าง และเปิดคิวข้อมูลจริงสำหรับยืนยัน รวม หรือปฏิเสธรายงานได้โดยไม่ออกจากพื้นที่ผู้ดูแล.

FIRST VIEWPORT: sidebar คงที่ด้านซ้าย, topbar ด้านบน, หัวเรื่อง, ป้ายข้อมูลตัวอย่าง และสรุปตัวเลขหกชุด; ปุ่มตรวจสอบเหตุการณ์เด่นใน Quick Actions เปิดคิวตรวจสอบที่เรียก API เดิม.

FORM: แดชบอร์ดปฏิบัติการแบบ reference-led; seed key: pinned-reference-dashboard.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
