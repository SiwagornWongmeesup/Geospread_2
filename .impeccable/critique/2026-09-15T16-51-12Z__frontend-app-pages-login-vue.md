---
target: หน้า Login ของ GeoSpread
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\User\\Project\\Geospread\\frontend\\app\\pages\\login.vue"
target_fingerprint: "sha256:4faa416afb3ccd2ea3fe773eef0d634581517e0847954da9f120749f4db23c00"
target_path: "C:\\Users\\User\\Project\\Geospread\\frontend\\app\\pages\\login.vue"
timestamp: 2026-09-15T16-51-12Z
slug: frontend-app-pages-login-vue
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 2 | มี loading แต่ไม่มีสถานะ Google และการยืนยันผลสำเร็จก่อน redirect |
| 2 | Match System / Real World | 3 | ข้อความไทยธรรมชาติ แต่ Google/Event Room ยังปนภาษาและไม่อธิบาย |
| 3 | User Control and Freedom | 2 | ไม่มีลืมรหัสผ่านหรือเส้นทางช่วยเมื่อเข้าไม่ได้ |
| 4 | Consistency and Standards | 3 | โทนและส่วนประกอบสม่ำเสมอ แต่ mobile ตัด label ที่ desktop มี |
| 5 | Error Prevention | 2 | มี required/type=email เท่านั้น ไม่มี autocomplete หรือแสดงรหัสผ่าน |
| 6 | Recognition Rather Than Recall | 3 | โครง form ชัด แต่ mobile ใช้ placeholder แทน label |
| 7 | Flexibility and Efficiency | 1 | ไม่มี password-manager cue หรือ auth ทางเลือกที่ใช้งานจริง |
| 8 | Aesthetic and Minimalist Design | 3 | สะอาดและโฟกัสดี แต่ visual ยังเป็นสูตร SaaS ทั่วไป |
| 9 | Error Recovery | 2 | แสดง error ได้ แต่ไม่มีทางแก้ปัญหาต่อที่ชัดเจน |
| 10 | Help and Documentation | 0 | ไม่มี recovery หรือช่องทางช่วยเหลือ |
| **Total** | | **21/40** | **Acceptable** |

## Design Specificity Verdict

หน้า Login มีข้อความเฉพาะ GeoSpread แต่ภาพรวมยังให้ความรู้สึกเป็น template/AI-generated ค่อนข้างชัด: split-screen สี navy, glow สีม่วง, CTA แดง, card form และ emoji เป็นชุดรูปแบบ SaaS ที่นำชื่อผลิตภัณฑ์อื่นมาแทนได้ทันที. ตัวตรวจจับไม่พบแพตเทิร์นโค้ดที่ผิดปกติ (0 findings) จึงไม่ได้ขัดแย้งกับข้อสรุปนี้ เพราะความรู้สึก generic เป็นเรื่ององค์ประกอบและภาษา visual มากกว่ากฎโค้ด.

## Overall Impression

โครงใช้งานง่ายและสะอาด แต่ยังไม่ส่งความน่าเชื่อถือหรือความเฉพาะตัวของแพลตฟอร์มข้อมูลความปลอดภัยตามพื้นที่. โอกาสใหญ่ที่สุดคือทำให้ login เป็นจุดเริ่มต้นที่ "เชื่อถือได้และควบคุมได้" แทนหน้าล็อกอิน SaaS สำเร็จรูป.

## What's Working

- Desktop แบ่งบริบทแบรนด์และ form ชัด ผู้ใช้มองเห็น CTA หลักทันที.
- Form สั้น มีเพียงอีเมลและรหัสผ่าน พร้อม loading/error ใน flow.
- ตั้งใจรองรับมือถือแยก component และปุ่มหลักเต็มความกว้าง.

## Priority Issues

### [P1] ปุ่ม Google ให้ความคาดหวังที่ไม่จริง

ปุ่ม `Sign in with Google` ไม่มี handler ทั้ง desktop และ mobile. ผู้ใช้อาจกดเส้นทางหลักแล้วไม่เกิดอะไรขึ้น ซึ่งทำลายความเชื่อถือทันที. ควรเชื่อม OAuth จริง หรือซ่อนปุ่มและ divider จนกว่าจะพร้อม.

### [P1] ไม่มีทางกู้บัญชีและ reassurance

ไม่มีลิงก์ลืมรหัสผ่าน, ความเป็นส่วนตัว/ความปลอดภัย, หรือช่องทางช่วยเมื่อเข้าสู่ระบบไม่ได้. ควรเพิ่ม recovery ใต้ password, copy สั้น ๆ ที่พิสูจน์ได้ และ action ต่อจาก error เช่น รีเซ็ตรหัสผ่าน.

### [P1] Mobile accessibility ยังไม่ครบ

input บนมือถือไม่มี label ที่ผูกกับ field, emoji อาจสร้างเสียงรบกวนสำหรับ screen reader และไม่เห็น `:focus-visible` สำหรับ button/link. ควรเพิ่ม label (แสดงหรือ sr-only), จัด emoji เป็น decorative, focus state และ `aria-live` ให้ error/loading.

### [P2] ภาษา visual ยังสลับแบรนด์ได้ง่าย

emoji หมุด, feature card, radial glow และ dark SaaS palette ยังไม่ได้ใช้เอกลักษณ์ geospatial/safety ที่มีความหมาย. ควรใช้ brand mark จริงหรือรายละเอียดแผนที่/สัญญาณตำแหน่งอย่างละเอียด และเปลี่ยน feature list เป็น reassurance ที่ยืนยันได้.

### [P2] ภาษาและ contrast ต้องขัดเกลา

มีไทย/อังกฤษปนกัน (`Sign in with Google`, `Event Room`) ข้อความรองสีเทาบน navy และ divider ขนาด 10–11px มีความเสี่ยงอ่านยาก. ควรแปล/กำหนดศัพท์ให้สม่ำเสมอ และทดสอบ contrast ก่อนปรับสีหรือขนาดขั้นต่ำ.

## Persona Red Flags

- **Jordan (ผู้ใช้ใหม่):** ปุ่ม Google เด่นแต่กดไม่ได้, ไม่รู้จะทำอย่างไรถ้าลืมรหัสผ่าน และไม่มีคำยืนยันความน่าเชื่อถือก่อนกรอกรหัสผ่าน.
- **Sam (ผู้ใช้ที่พึ่ง accessibility):** mobile ไม่มี programmatic label; emoji และ focus state ทำให้การใช้ keyboard/screen reader ไม่แน่นอน.
- **Casey (ผู้ใช้มือถือที่ถูกขัดจังหวะ):** dead-end ของ Google ทำให้เสียเวลา; ไม่เห็นการเก็บค่าฟอร์มหรือ recovery เมื่อสลับแอป.

## Minor Observations

desktop label ยังไม่มี `for` แม้ input มี `id`; native validation อาจไม่เป็นภาษาไทยตาม UI; หลัง login สำเร็จ redirect ทันทีโดยไม่มี confirmation.
