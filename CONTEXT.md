# GeoSpread Context

คำศัพท์ธุรกิจที่ใช้ร่วมกันสำหรับแพลตฟอร์มความปลอดภัยชุมชนอิงตำแหน่งของ GeoSpread

## Language

**Community User**:
บุคคลทั่วไปที่ใช้ GeoSpread เพื่อติดตามเหตุการณ์และความปลอดภัยของพื้นที่ รวมถึงแจ้งหรือขอความช่วยเหลือ
_Avoid_: User เมื่อหมายถึงผู้ดูแลระบบโดยเฉพาะ, Member

**Administrator**:
ผู้ใช้ที่ได้รับสิทธิ์จัดการระบบในพื้นที่ผู้ดูแลเฉพาะหลังผ่านการยืนยันตัวตน
_Avoid_: Admin User, Back-office User

**User Dashboard**:
พื้นที่หลักสำหรับ Community User ในการดูข้อมูลพื้นที่ เหตุการณ์ การช่วยเหลือ และข้อมูลส่วนตัว
_Avoid_: Admin Dashboard, Control Panel

**Incident**:
เหตุการณ์หลักที่ระบบสร้างหรือรวมจาก Incident Report หนึ่งรายการหรือหลายรายการ เพื่อสรุปสถานการณ์เดียวกัน
_Avoid_: Raw Report, News, Alert

**Incident Report**:
ข้อมูลดิบที่ Community User ส่งแต่ละครั้ง โดยมีข้อความเหตุการณ์และตำแหน่งเป็นข้อมูลหลัก; อาจยังไม่ถูกเชื่อมกับ Incident หลักในทันที
_Avoid_: Complaint, Ticket

**Incident Type**:
ประเภทมาตรฐานที่ระบบรู้จัก ใช้กำหนด icon, Map Display Mode และ Impact Radius ของ Incident
_Avoid_: Incident, Category

**Incident Category**:
หมวดใหญ่ที่ใช้จัดกลุ่ม Incident Type สำหรับการแสดงผลและค้นหา
_Avoid_: Incident Type

**Incident Media**:
รูปภาพหรือวิดีโอที่แนบกับ Incident Report หนึ่งรายการ
_Avoid_: Incident Attachment เมื่อหมายถึงไฟล์ของ Incident หลัก

**Reported Observation**:
ข้อความอิสระที่ Community User ใช้อธิบายว่าเห็นอะไรหรือเกิดอะไรขึ้นใน Incident Report
_Avoid_: Fixed Category, Severity Input

**Suggested Incident Type**:
Incident Type ที่ระบบจัดอันดับจาก Reported Observation เพื่อช่วยให้ Community User เลือกได้เร็วขึ้น; เป็นเพียงคำแนะนำและไม่ถือเป็น Type ที่ผู้ใช้เลือกจนกว่าผู้ใช้จะกดยืนยันเอง
_Avoid_: Suggested Category, Mandatory Category, Final Classification

**Custom Report Type**:
ประเภทที่ Community User ระบุเองเมื่อไม่มี Suggested Incident Type ที่ตรงกับสิ่งที่พบ
_Avoid_: Invalid Report, Unsupported Report

**Unclassified Incident Report**:
Incident Report ที่ผู้ใช้ยังไม่ได้เลือก Incident Type มาตรฐาน แม้ระบบอาจมี Suggested Incident Type อยู่; รายงานยังถูกส่งได้และเริ่มต้นด้วยสถานะรอตรวจสอบ
_Avoid_: Invalid Report, Auto-selected Type

**Map Display Mode**:
กติกาที่กำหนดการแสดง Incident บนแผนที่ตามประเภทมาตรฐาน เช่น Marker หรือ Icon พร้อม Impact Radius
_Avoid_: Severity Display Rule

**Impact Radius**:
ขอบเขตผลกระทบเริ่มต้นของประเภทมาตรฐานที่ระบบรู้จัก ซึ่งอาจปรับโดย Administrator สำหรับเหตุเฉพาะรายได้ภายหลัง
_Avoid_: Severity Radius

**Severity Level**:
ระดับผลกระทบของ Incident ที่ระบบหรือ Administrator ประเมินภายหลังจากข้อมูลผลกระทบ การยืนยัน และสถานการณ์; Community User ไม่ได้เลือกค่านี้ในแบบฟอร์ม
_Avoid_: Priority เมื่อไม่ได้หมายถึงลำดับการจัดการของเจ้าหน้าที่

**Credibility**:
ระดับความมั่นใจว่าข้อมูลของ Incident น่าเชื่อถือหรือเกิดขึ้นจริง ซึ่งแยกอิสระจาก Severity Level
_Avoid_: Severity, Priority

**Nearby Incident**:
Incident ที่ถูกจัดลำดับให้ Community User เห็นก่อน เพราะอยู่ใกล้ตำแหน่งปัจจุบันหรือ Followed Location
_Avoid_: Local News

**Safety Guide**:
แนวทางปฏิบัติเพื่อความปลอดภัยที่แสดงตาม Incident ที่ Community User เลือกดู
_Avoid_: Generic Help

**Followed Location**:
พื้นที่สำคัญที่ Community User บันทึกไว้เพื่อรับข้อมูลและการแจ้งเตือนที่เกี่ยวข้อง
_Avoid_: Saved Place, Watch Area
