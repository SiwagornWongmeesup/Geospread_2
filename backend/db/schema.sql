-- โครงสร้างฐานข้อมูล GeoSpread (แหล่งอ้างอิงหลัก)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ข้อมูลบัญชีผู้ใช้งานระบบ
CREATE TABLE IF NOT EXISTS tb_users (
    -- รหัสผู้ใช้ ใช้ระบุบัญชีผู้ใช้แต่ละคน
    id SERIAL PRIMARY KEY,
    -- อีเมล ใช้เข้าสู่ระบบและต้องไม่ซ้ำกัน
    email VARCHAR(255) UNIQUE NOT NULL,
    -- รหัสผ่านที่เข้ารหัสแล้ว ใช้ยืนยันตัวตนผู้ใช้
    password TEXT NOT NULL,
    -- ชื่อจริงของผู้ใช้
    name VARCHAR(50),
    -- นามสกุลของผู้ใช้
    lastname VARCHAR(50),
    -- URL หรือข้อมูลรูปโปรไฟล์ของผู้ใช้
    profile TEXT,
    -- เบอร์โทรศัพท์สำหรับติดต่อผู้ใช้
    phone VARCHAR(20),
    -- บทบาทที่ใช้กำหนดสิทธิ์การใช้งานในระบบ
    role VARCHAR(50) DEFAULT 'user',
    -- คะแนนความน่าเชื่อถือของผู้ใช้
    trust_score INT DEFAULT 100,
    -- วันที่และเวลาที่สร้างบัญชีผู้ใช้
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่แก้ไขข้อมูลผู้ใช้ล่าสุด
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่ผู้ใช้เข้าสู่ระบบล่าสุด
    last_login_at TIMESTAMP
);

-- ยืนยันอีเมล: บัญชีที่มีอยู่ก่อนเพิ่มคอลัมน์นี้ถือว่ายืนยันแล้ว (DEFAULT TRUE ตอนเพิ่ม)
-- แล้วเปลี่ยนค่าเริ่มต้นเป็น FALSE ให้บัญชีที่สมัครใหม่ต้องยืนยันอีเมลก่อนเข้าสู่ระบบ
ALTER TABLE tb_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE tb_users ALTER COLUMN email_verified SET DEFAULT FALSE;

-- รหัสยืนยันอีเมล 6 หลักที่ยังไม่ได้ใช้ (หนึ่งแถวต่อผู้ใช้ ส่งรหัสใหม่จะเขียนทับของเดิม)
CREATE TABLE IF NOT EXISTS tb_email_verifications (
    -- ผู้ใช้ที่ต้องยืนยันอีเมล
    user_id INT PRIMARY KEY REFERENCES tb_users(id) ON DELETE CASCADE,
    -- รหัสที่ผ่าน HMAC แล้ว (ไม่เก็บตัวเลขจริง)
    code_hash TEXT NOT NULL,
    -- เวลาหมดอายุของรหัส
    expires_at TIMESTAMPTZ NOT NULL,
    -- จำนวนครั้งที่กรอกรหัสผิด ใช้กันการเดารหัส
    attempts SMALLINT NOT NULL DEFAULT 0,
    -- เวลาที่ส่งรหัสล่าสุด ใช้จำกัดการกดส่งรหัสใหม่
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- หมวดใหญ่ ใช้จัดกลุ่มประเภทเหตุการณ์ในหน้าจอและการค้นหา
CREATE TABLE IF NOT EXISTS tb_incident_categories (
    -- รหัสหมวดหมู่ ใช้ระบุหมวดของประเภทเหตุการณ์
    category_id SERIAL PRIMARY KEY,
    -- รหัสหมวดหมู่แบบคงที่ ใช้อ้างอิงหมวดในระบบ
    category_code VARCHAR(80) UNIQUE NOT NULL,
    -- ชื่อหมวดหมู่ภาษาไทยที่แสดงให้ผู้ใช้เห็น
    category_name VARCHAR(120) NOT NULL,
    -- ชื่อไอคอนที่ใช้แสดงแทนหมวดหมู่
    icon_name VARCHAR(120),
    -- ลำดับที่ใช้จัดเรียงหมวดหมู่บนหน้าจอ
    sort_order INT NOT NULL DEFAULT 0,
    -- สถานะว่าเปิดให้เลือกใช้หมวดหมู่นี้หรือไม่
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- วันที่และเวลาที่สร้างหมวดหมู่
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่แก้ไขหมวดหมู่ล่าสุด
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ประเภทมาตรฐานที่ระบบรู้จัก และกำหนดกฎการแสดงผลบนแผนที่
CREATE TABLE IF NOT EXISTS tb_incident_types (
    -- รหัสประเภทเหตุการณ์ ใช้ระบุประเภทแต่ละรายการ
    type_id SERIAL PRIMARY KEY,
    -- รหัสหมวดหมู่ที่ประเภทเหตุการณ์นี้สังกัด
    category_id INT NOT NULL REFERENCES tb_incident_categories(category_id) ON DELETE RESTRICT,
    -- รหัสประเภทแบบคงที่ ใช้อ้างอิงประเภทในระบบ
    type_code VARCHAR(100) UNIQUE NOT NULL,
    -- ชื่อประเภทเหตุการณ์ภาษาไทยที่แสดงให้ผู้ใช้เห็น
    type_name VARCHAR(150) NOT NULL,
    -- ชื่อไอคอนที่ใช้แสดงเหตุการณ์ประเภทนี้บนแผนที่
    icon_name VARCHAR(120) NOT NULL,
    -- สีของหมุดที่ใช้แสดงเหตุการณ์ประเภทนี้บนแผนที่
    marker_color VARCHAR(20) NOT NULL DEFAULT '#1479EF',
    -- รูปแบบการแสดงเหตุการณ์บนแผนที่
    display_mode VARCHAR(20) NOT NULL DEFAULT 'marker',
    -- รัศมีเริ่มต้นหน่วยเมตรเมื่อแสดงแบบใกล้เคียงหรือเป็นพื้นที่
    default_radius_m INTEGER,
    -- สถานะว่าเปิดให้ผู้ใช้เลือกประเภทนี้หรือไม่
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- แสดงเป็นทางลัดในส่วนเหตุการณ์ที่พบบ่อยหรือไม่
    is_quick BOOLEAN NOT NULL DEFAULT FALSE,
    -- ลำดับที่ใช้จัดเรียงประเภทเหตุการณ์บนหน้าจอ
    sort_order INT NOT NULL DEFAULT 0,
    -- วันที่และเวลาที่สร้างประเภทเหตุการณ์
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่แก้ไขประเภทเหตุการณ์ล่าสุด
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_type_mode CHECK (display_mode IN ('marker', 'nearby', 'area')),
    CONSTRAINT chk_type_radius CHECK ((display_mode = 'marker' AND default_radius_m IS NULL) OR (display_mode IN ('nearby', 'area') AND default_radius_m > 0))
);

-- คำที่ใช้จับข้อความเพื่อแนะนำประเภทเหตุการณ์
CREATE TABLE IF NOT EXISTS tb_incident_keywords (
    -- รหัสคำสำคัญ ใช้ระบุคำสำคัญแต่ละรายการ
    keyword_id SERIAL PRIMARY KEY,
    -- รหัสประเภทเหตุการณ์ที่คำสำคัญนี้ใช้แนะนำ
    type_id INT NOT NULL REFERENCES tb_incident_types(type_id) ON DELETE CASCADE,
    -- คำหรือวลีที่ใช้ค้นหาในข้อความรายงานเพื่อแนะนำประเภทเหตุการณ์
    keyword VARCHAR(150) NOT NULL,
    -- สถานะว่าเปิดใช้คำสำคัญนี้ในการค้นหาหรือไม่
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- วันที่และเวลาที่เพิ่มคำสำคัญ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่แก้ไขคำสำคัญล่าสุด
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_keyword_per_type UNIQUE (type_id, keyword)
);

-- เหตุการณ์หลักที่ใช้รวมรายงานหลายรายการซึ่งอ้างถึงเหตุเดียวกัน เพื่อสรุป แสดงผล และติดตามสถานะของเหตุการณ์บนแผนที่
CREATE TABLE IF NOT EXISTS tb_incidents (
    -- รหัสเหตุการณ์หลัก ใช้ระบุเหตุการณ์ที่รวบรวมจากรายงาน
    incident_id SERIAL PRIMARY KEY,
    -- รหัสประเภทเหตุการณ์ปัจจุบันที่ใช้แสดงผล และผู้ดูแลอาจปรับได้ภายหลัง
    final_type_id INT REFERENCES tb_incident_types(type_id) ON DELETE SET NULL,
    -- หัวข้อสรุปที่ใช้แสดงชื่อเหตุการณ์
    title VARCHAR(255) NOT NULL,
    -- รายละเอียดสรุปของเหตุการณ์
    description TEXT,
    -- พิกัดจุดศูนย์กลางของเหตุการณ์ที่ใช้แสดงบนแผนที่
    incident_location GEOMETRY(Point, 4326) NOT NULL,
    -- รูปแบบที่ใช้แสดงเหตุการณ์บนแผนที่
    display_mode VARCHAR(20) NOT NULL DEFAULT 'marker',
    -- รัศมีพื้นที่ของเหตุการณ์หน่วยเมตร
    radius_m INTEGER,
    -- ระดับความรุนแรงของเหตุการณ์
    severity VARCHAR(20) NOT NULL DEFAULT 'unrated',
    -- คะแนนความน่าเชื่อถือของเหตุการณ์ ตั้งแต่ 0 ถึง 100
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    -- สถานะการตรวจสอบความถูกต้องของเหตุการณ์
    verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
    -- สถานะปัจจุบันของเหตุการณ์ เช่น กำลังเกิด แก้ไขแล้ว หรือปิดเรื่อง
    incident_status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- Incident ปลายทางเมื่อเหตุนี้ถูกรวมเข้ากับเหตุอื่นแล้ว
    merged_into_incident_id INT REFERENCES tb_incidents(incident_id) ON DELETE SET NULL,
    -- จำนวนรายงานที่เชื่อมโยงกับเหตุการณ์นี้
    report_count INTEGER NOT NULL DEFAULT 0,
    -- วันที่และเวลาที่ได้รับรายงานแรกของเหตุการณ์
    first_reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่ได้รับรายงานล่าสุดของเหตุการณ์
    last_reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่สร้างเหตุการณ์หลัก
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่แก้ไขเหตุการณ์หลักล่าสุด
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_incident_mode CHECK (display_mode IN ('marker', 'nearby', 'area')),
    CONSTRAINT chk_incident_radius CHECK ((display_mode = 'marker' AND radius_m IS NULL) OR (display_mode IN ('nearby', 'area') AND radius_m > 0)),
    CONSTRAINT chk_incident_severity CHECK (severity IN ('unrated', 'low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_incident_confidence CHECK (confidence_score BETWEEN 0 AND 100),
    CONSTRAINT chk_incident_verification CHECK (verification_status IN ('unverified', 'verified')),
    CONSTRAINT chk_incident_status CHECK (incident_status IN ('active', 'resolved')),
    CONSTRAINT chk_incident_count CHECK (report_count >= 0)
);

-- รายงานข้อมูลดิบที่ผู้ใช้ในชุมชนส่งเข้ามาในแต่ละครั้ง
CREATE TABLE IF NOT EXISTS tb_incident_reports (
    -- รหัสรายงาน ใช้ระบุรายงานแต่ละรายการที่ผู้ใช้ส่ง
    report_id SERIAL PRIMARY KEY,
    -- รหัสผู้ใช้ที่ส่งรายงาน โดยเว้นว่างได้หากผู้ใช้ถูกลบ
    user_id INT REFERENCES tb_users(id) ON DELETE SET NULL,
    -- Trust Score ของผู้รายงานขณะส่ง เก็บไว้เพื่อประเมิน Credibility ย้อนหลัง
    reporter_trust_score INT NOT NULL DEFAULT 100,
    -- รหัสเหตุการณ์หลักที่รายงานนี้เชื่อมโยง
    incident_id INT REFERENCES tb_incidents(incident_id) ON DELETE SET NULL,
    -- ข้อความรายละเอียดเหตุการณ์ที่ผู้ใช้รายงาน
    description TEXT NOT NULL,
    -- รหัสประเภทเหตุการณ์ที่ผู้ใช้เลือกเอง
    user_selected_type_id INT REFERENCES tb_incident_types(type_id) ON DELETE SET NULL,
    -- รหัสประเภทเหตุการณ์ที่ระบบแนะนำจากข้อความรายงาน
    system_suggested_type_id INT REFERENCES tb_incident_types(type_id) ON DELETE SET NULL,
    -- รหัสประเภทเหตุการณ์สุดท้ายที่ระบบหรือผู้ดูแลยืนยันให้รายงาน
    final_type_id INT REFERENCES tb_incident_types(type_id) ON DELETE SET NULL,
    -- สถานะของการจัดประเภทเหตุการณ์ในรายงาน
    type_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- พิกัดจุดเกิดเหตุที่ผู้ใช้ระบุ
    incident_location GEOMETRY(Point, 4326) NOT NULL,
    -- แหล่งที่มาของจุดเกิดเหตุ: พิกัดเครื่องหรือหมุดที่ผู้ใช้เลือกบนแผนที่
    incident_location_source VARCHAR(20) NOT NULL DEFAULT 'unknown',
    -- พิกัดของผู้รายงานขณะส่งรายงาน ใช้ตรวจสอบภายใน
    reporter_location GEOMETRY(Point, 4326),
    -- รัศมีความคลาดเคลื่อนและเวลาที่อุปกรณ์อ่านตำแหน่งผู้รายงาน
    reporter_accuracy_m NUMERIC(10, 2),
    reporter_captured_at TIMESTAMPTZ,
    -- ระยะห่างระหว่างผู้รายงานกับจุดเกิดเหตุ หน่วยเมตร
    distance_from_reporter NUMERIC(10, 2),
    -- สถานะการตรวจสอบรายงาน แยกจาก incident_id และ Candidate
    report_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- สถานะปัจจุบันของเหตุที่รายงานนี้ติดตาม แยกจากสถานะการตรวจสอบ Report
    event_status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- เวลาที่หยุดแสดง Report นี้บนแผนที่ แต่ไม่ลบข้อมูลประวัติออกจากระบบ
    expires_at TIMESTAMPTZ,
    -- สถานะระบุว่ารายงานนี้มีความผิดปกติหรือน่าสงสัย
    is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
    -- วันที่และเวลาที่ผู้ใช้ส่งรายงาน
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- วันที่และเวลาที่แก้ไขรายงานล่าสุด
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_report_type_status CHECK (type_status IN ('confirmed', 'pending', 'conflict')),
    CONSTRAINT chk_report_status CHECK (report_status IN ('pending', 'verified', 'rejected')),
    CONSTRAINT chk_report_event_status CHECK (event_status IN ('active', 'improving', 'resolved', 'expired')),
    CONSTRAINT chk_report_distance CHECK (distance_from_reporter IS NULL OR distance_from_reporter >= 0),
    CONSTRAINT chk_report_location_source CHECK (incident_location_source IN ('device', 'map', 'unknown')),
    CONSTRAINT chk_report_accuracy CHECK (reporter_accuracy_m IS NULL OR reporter_accuracy_m >= 0)
);

-- รายงานจากชุมชนที่แจ้งว่า Incident อาจเป็นข้อมูลเท็จหรือคลาดเคลื่อน
CREATE TABLE IF NOT EXISTS tb_incident_false_reports (
    false_report_id SERIAL PRIMARY KEY,
    incident_id INT NOT NULL REFERENCES tb_incidents(incident_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_false_report_per_user UNIQUE (incident_id, user_id)
);

-- schema นี้ถูกใช้กับฐานข้อมูลเดิมด้วย จึงเพิ่ม field แบบไม่กระทบข้อมูลเก่า
ALTER TABLE tb_incident_reports
    ADD COLUMN IF NOT EXISTS incident_location_source VARCHAR(20) NOT NULL DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS reporter_accuracy_m NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS reporter_captured_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS event_status VARCHAR(20) NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ไม่ใช้ custom_type ใน flow ปัจจุบันแล้ว; รายละเอียดอิสระอยู่ใน description
ALTER TABLE tb_incident_reports DROP COLUMN IF EXISTS custom_type;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_report_location_source') THEN
        ALTER TABLE tb_incident_reports
            ADD CONSTRAINT chk_report_location_source
            CHECK (incident_location_source IN ('device', 'map', 'unknown'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_report_accuracy') THEN
        ALTER TABLE tb_incident_reports
            ADD CONSTRAINT chk_report_accuracy
            CHECK (reporter_accuracy_m IS NULL OR reporter_accuracy_m >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_report_event_status') THEN
        ALTER TABLE tb_incident_reports
            ADD CONSTRAINT chk_report_event_status
            CHECK (event_status IN ('active', 'improving', 'resolved', 'expired'));
    END IF;
END $$;

-- ทุกความคืบหน้าของเหตุเก็บเป็นประวัติใหม่ ไม่เขียนทับข้อความ Report ต้นฉบับ
CREATE TABLE IF NOT EXISTS tb_incident_report_updates (
    report_update_id SERIAL PRIMARY KEY,
    report_id INT NOT NULL REFERENCES tb_incident_reports(report_id) ON DELETE CASCADE,
    -- ผู้ที่แจ้งความคืบหน้า เช่น เจ้าของ Report หรือ Administrator
    user_id INT REFERENCES tb_users(id) ON DELETE SET NULL,
    -- ข้อความความคืบหน้า เช่น "เจ้าหน้าที่กำลังเข้าพื้นที่" หรือ "ระดับน้ำลดลงแล้ว"
    message TEXT NOT NULL,
    -- สถานะเหตุหลังอัปเดตนี้ ต้องสอดคล้องกับ event_status ของ Report
    status_after VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_report_update_message CHECK (char_length(trim(message)) BETWEEN 1 AND 1000),
    CONSTRAINT chk_report_update_status CHECK (status_after IN ('active', 'improving', 'resolved', 'expired'))
);

-- Report ที่ยังไม่มี Type แต่ใกล้ Incident ที่มีอยู่ จึงรอ Administrator ตรวจสอบ
CREATE TABLE IF NOT EXISTS tb_incident_report_candidates (
    candidate_id SERIAL PRIMARY KEY,
    -- Report ดิบที่ยังไม่ได้รวมเข้า Incident
    report_id INT NOT NULL UNIQUE REFERENCES tb_incident_reports(report_id) ON DELETE CASCADE,
    -- Incident ที่อยู่ใกล้ที่สุดและอาจเกี่ยวข้อง
    target_incident_id INT NOT NULL REFERENCES tb_incidents(incident_id),
    -- ระยะและเวลาที่ใช้เสนอ Candidate ให้ Administrator
    distance_m NUMERIC(10, 2) NOT NULL,
    time_difference_minutes NUMERIC(10, 2) NOT NULL,
    -- pending, accepted หรือ rejected
    candidate_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- ผู้ดูแลที่ตัดสิน candidate และหมายเหตุประกอบ
    decided_by INT REFERENCES tb_users(id) ON DELETE SET NULL,
    decision_note TEXT,
    decided_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_report_candidate_measurements CHECK (distance_m >= 0 AND time_difference_minutes >= 0),
    CONSTRAINT chk_report_candidate_status CHECK (candidate_status IN ('pending', 'accepted', 'rejected'))
);

-- กลุ่ม Report ที่ไม่มี Type และอยู่ใกล้กัน เพื่อให้ Administrator ตรวจพร้อมกัน
CREATE TABLE IF NOT EXISTS tb_incident_candidate_groups (
    candidate_group_id SERIAL PRIMARY KEY,
    -- Report แรกที่เป็นจุดอ้างอิงของกลุ่ม
    anchor_report_id INT NOT NULL REFERENCES tb_incident_reports(report_id) ON DELETE RESTRICT,
    candidate_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    decided_by INT REFERENCES tb_users(id) ON DELETE SET NULL,
    decision_note TEXT,
    decided_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_candidate_group_status CHECK (candidate_status IN ('pending', 'accepted', 'rejected'))
);

-- สมาชิกของ Candidate Group ยังคงเป็น Report แยกกัน
CREATE TABLE IF NOT EXISTS tb_incident_candidate_group_reports (
    candidate_group_id INT NOT NULL REFERENCES tb_incident_candidate_groups(candidate_group_id) ON DELETE CASCADE,
    report_id INT NOT NULL UNIQUE REFERENCES tb_incident_reports(report_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (candidate_group_id, report_id)
);

-- รูปภาพหรือวิดีโอที่แนบกับรายงานหนึ่งรายการ
CREATE TABLE IF NOT EXISTS tb_incident_media (
    -- รหัสไฟล์แนบ ใช้ระบุรูปภาพหรือวิดีโอแต่ละรายการ
    media_id SERIAL PRIMARY KEY,
    -- รหัสรายงานเจ้าของไฟล์แนบ
    report_id INT NOT NULL REFERENCES tb_incident_reports(report_id) ON DELETE CASCADE,
    -- ชนิดของไฟล์แนบ ว่าเป็นรูปภาพหรือวิดีโอ
    media_type VARCHAR(20) NOT NULL,
    -- ที่อยู่ไฟล์แนบในระบบจัดเก็บไฟล์
    media_url TEXT NOT NULL,
    -- วันที่และเวลาที่เพิ่มไฟล์แนบ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_media_type CHECK (media_type IN ('image', 'video'))
);

-- คำขอความช่วยเหลือเป็นข้อมูลคนละโดเมนกับ Incident Report: ทุกคำขออยู่แยกกันและไม่ถูก merge
CREATE TABLE IF NOT EXISTS tb_help_requests (
    help_request_id SERIAL PRIMARY KEY,
    -- ผู้ขอความช่วยเหลือ
    user_id INT REFERENCES tb_users(id) ON DELETE SET NULL,
    -- ประเภทความช่วยเหลือที่ผู้ใช้เลือกจากฟอร์ม
    help_type VARCHAR(30) NOT NULL,
    -- ภัยพิบัติที่เกี่ยวข้องหรือความต้องการที่พิมพ์เอง เมื่อเลือก "อื่น ๆ"
    related_disaster VARCHAR(50),
    custom_help_type VARCHAR(255),
    description TEXT NOT NULL,
    -- จำนวนคนขั้นต่ำที่ต้องการความช่วยเหลือ; ค่า 4 แทนตัวเลือก "4+"
    people_count SMALLINT NOT NULL DEFAULT 1,
    -- ตำแหน่งที่ต้องการความช่วยเหลือ และแหล่งที่มาของตำแหน่ง
    help_location GEOMETRY(Point, 4326) NOT NULL,
    location_source VARCHAR(20) NOT NULL DEFAULT 'unknown',
    -- ตำแหน่งของผู้ขอ ณ เวลาส่ง ใช้ตรวจสอบภายใน ไม่จำเป็นต้องเป็นจุดขอความช่วยเหลือ
    reporter_location GEOMETRY(Point, 4326),
    reporter_accuracy_m NUMERIC(10, 2),
    reporter_captured_at TIMESTAMPTZ,
    -- pending → accepted → in_progress → resolved; หรือ cancelled / expired
    request_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    accepted_by INT REFERENCES tb_users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    -- เมื่อถึงเวลานี้ให้ซ่อนหมุดจากแผนที่ แต่เก็บ record และประวัติไว้
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_help_request_type CHECK (help_type IN ('evacuation', 'medical', 'food', 'shelter', 'vehicle', 'other')),
    CONSTRAINT chk_help_request_people CHECK (people_count >= 1 AND people_count <= 999),
    CONSTRAINT chk_help_request_location_source CHECK (location_source IN ('device', 'map', 'unknown')),
    CONSTRAINT chk_help_request_accuracy CHECK (reporter_accuracy_m IS NULL OR reporter_accuracy_m >= 0),
    CONSTRAINT chk_help_request_status CHECK (request_status IN ('pending', 'accepted', 'in_progress', 'resolved', 'cancelled', 'expired'))
);

-- ชื่อเดิม custom_type อาจหลงเหลือจาก schema รุ่นแรกของ Help Request
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tb_help_requests' AND column_name = 'custom_type'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tb_help_requests' AND column_name = 'custom_help_type'
    ) THEN
        ALTER TABLE tb_help_requests RENAME COLUMN custom_type TO custom_help_type;
    END IF;
END $$;

-- Timeline ความคืบหน้าของคำขอช่วยเหลือ ไม่เขียนทับข้อความคำขอเริ่มต้น
CREATE TABLE IF NOT EXISTS tb_help_request_updates (
    help_request_update_id SERIAL PRIMARY KEY,
    help_request_id INT NOT NULL REFERENCES tb_help_requests(help_request_id) ON DELETE CASCADE,
    user_id INT REFERENCES tb_users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status_after VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_help_request_update_message CHECK (char_length(trim(message)) BETWEEN 1 AND 1000),
    CONSTRAINT chk_help_request_update_status CHECK (status_after IN ('pending', 'accepted', 'in_progress', 'resolved', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_types_category ON tb_incident_types(category_id);
CREATE INDEX IF NOT EXISTS idx_keywords_active ON tb_incident_keywords(keyword) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_main_incidents_location ON tb_incidents USING GIST (incident_location);
CREATE INDEX IF NOT EXISTS idx_incidents_active ON tb_incidents(incident_status, last_reported_at DESC) WHERE incident_status = 'active';
CREATE INDEX IF NOT EXISTS idx_reports_location ON tb_incident_reports USING GIST (incident_location);
CREATE INDEX IF NOT EXISTS idx_reports_incident ON tb_incident_reports(incident_id);
CREATE INDEX IF NOT EXISTS idx_false_reports_incident_created ON tb_incident_false_reports(incident_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_event_status_expiry ON tb_incident_reports(event_status, expires_at);
CREATE INDEX IF NOT EXISTS idx_report_updates_report_created ON tb_incident_report_updates(report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_report ON tb_incident_media(report_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_location ON tb_help_requests USING GIST (help_location);
CREATE INDEX IF NOT EXISTS idx_help_requests_status_expiry ON tb_help_requests(request_status, expires_at);
CREATE INDEX IF NOT EXISTS idx_help_request_updates_request_created ON tb_help_request_updates(help_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_candidates_pending_target
    ON tb_incident_report_candidates(target_incident_id, created_at DESC)
    WHERE candidate_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_candidate_groups_pending
    ON tb_incident_candidate_groups(created_at DESC)
    WHERE candidate_status = 'pending';

INSERT INTO tb_incident_categories (category_code, category_name, icon_name, sort_order) VALUES
    ('natural_disaster', 'ภัยธรรมชาติ', 'cloud-rain', 1),
    ('accident', 'อุบัติเหตุและการจราจร', 'car-front', 2),
    ('safety', 'ความปลอดภัยและเหตุฉุกเฉิน', 'shield-alert', 3),
    ('infrastructure', 'สาธารณูปโภคและโครงสร้างพื้นฐาน', 'construction', 4),
    ('environment', 'สิ่งแวดล้อมและมลพิษ', 'leaf', 5),
    ('community', 'เหตุในชุมชน', 'users', 6)
ON CONFLICT (category_code) DO NOTHING;

-- ประเภทเหตุการณ์เริ่มต้นสำหรับรุ่นแรก; รัศมีเป็นค่าโดยประมาณ ไม่ใช่ขอบเขตภัยจริง
INSERT INTO tb_incident_types (category_id, type_code, type_name, icon_name, marker_color, display_mode, default_radius_m, sort_order)
SELECT category.category_id, seed.type_code, seed.type_name, seed.icon_name, seed.marker_color, seed.display_mode, seed.default_radius_m, seed.sort_order
FROM (
    VALUES
      ('natural_disaster', 'flood', 'น้ำท่วม', 'waves', '#1479EF', 'area', 3000, 1),
      ('natural_disaster', 'flash_flood', 'น้ำป่าไหลหลาก', 'waves-arrow-up', '#1479EF', 'area', 3000, 2),
      ('natural_disaster', 'storm', 'พายุ', 'cloud-lightning', '#6D5DFB', 'marker', NULL, 3),
      ('natural_disaster', 'wildfire', 'ไฟป่า', 'flame', '#E8333C', 'area', 5000, 4),
      ('natural_disaster', 'earthquake', 'แผ่นดินไหว', 'activity', '#F47B22', 'marker', NULL, 5),
      ('natural_disaster', 'tsunami', 'สึนามิ', 'waves', '#1479EF', 'marker', NULL, 6),
      ('natural_disaster', 'landslide', 'ดินถล่ม', 'mountain', '#A65B24', 'area', 1000, 7),
      ('natural_disaster', 'drought', 'ภัยแล้ง', 'sun', '#F0B429', 'marker', NULL, 8),
      ('accident', 'traffic_accident', 'รถชน', 'car-front', '#F47B22', 'nearby', 500, 1),
      ('accident', 'vehicle_rollover', 'รถคว่ำ', 'car-front', '#F47B22', 'nearby', 500, 2),
      ('accident', 'vehicle_obstruction', 'รถเสียกีดขวาง', 'car-front', '#F0B429', 'nearby', 300, 3),
      ('accident', 'road_obstruction', 'ถนนถูกกีดขวาง', 'construction', '#F0B429', 'nearby', 500, 4),
      ('accident', 'other_road_accident', 'อุบัติเหตุทางถนนอื่น ๆ', 'triangle-alert', '#F47B22', 'nearby', 500, 5),
      ('safety', 'building_fire', 'ไฟไหม้', 'flame', '#E8333C', 'nearby', 500, 1),
      ('safety', 'conflict', 'เหตุทะเลาะวิวาท', 'shield-alert', '#E8333C', 'nearby', 300, 2),
      ('safety', 'violent_incident', 'เหตุรุนแรง', 'shield-alert', '#E8333C', 'nearby', 500, 3),
      ('safety', 'missing_person', 'บุคคลสูญหาย', 'search', '#6D5DFB', 'nearby', 2000, 4),
      ('safety', 'suspicious_object', 'วัตถุต้องสงสัย', 'triangle-alert', '#E8333C', 'nearby', 500, 5),
      ('safety', 'other_fire', 'เหตุไฟไหม้อื่น ๆ', 'flame', '#E8333C', 'nearby', 1000, 6),
      ('infrastructure', 'power_outage', 'ไฟฟ้าดับ', 'zap-off', '#F0B429', 'marker', NULL, 1),
      ('infrastructure', 'fallen_pole', 'เสาไฟล้ม', 'utility-pole', '#F47B22', 'nearby', 200, 2),
      ('infrastructure', 'broken_power_line', 'สายไฟขาด', 'zap', '#E8333C', 'nearby', 200, 3),
      ('infrastructure', 'water_pipe_break', 'ท่อน้ำแตก', 'droplets', '#1479EF', 'nearby', 200, 4),
      ('infrastructure', 'water_supply_outage', 'น้ำประปาขัดข้อง', 'droplet-off', '#1479EF', 'marker', NULL, 5),
      ('infrastructure', 'road_damage', 'ถนนชำรุด', 'construction', '#F0B429', 'marker', NULL, 6),
      ('infrastructure', 'bridge_damage', 'สะพานเสียหาย', 'construction', '#F47B22', 'nearby', 500, 7),
      ('infrastructure', 'building_collapse', 'อาคารเสียหาย / ถล่ม', 'building-2', '#E8333C', 'nearby', 500, 8),
      ('environment', 'pm25', 'PM2.5 / ฝุ่น', 'wind', '#8D99AE', 'marker', NULL, 1),
      ('environment', 'abnormal_smoke', 'ควันผิดปกติ', 'cloud', '#8D99AE', 'nearby', 1000, 2),
      ('environment', 'air_pollution', 'มลพิษทางอากาศ', 'wind', '#8D99AE', 'marker', NULL, 3),
      ('environment', 'wastewater', 'น้ำเสีย', 'waves', '#1479EF', 'nearby', 500, 4),
      ('environment', 'chemical_odor', 'กลิ่นสารเคมี', 'flask-conical', '#E8333C', 'nearby', 1000, 5),
      ('environment', 'chemical_leak', 'สารเคมีรั่วไหล', 'flask-conical', '#E8333C', 'nearby', 1000, 6),
      ('environment', 'waste', 'ขยะ / ของเสีย', 'trash-2', '#8D99AE', 'marker', NULL, 7),
      ('community', 'missing_pet', 'สัตว์เลี้ยงหาย', 'paw-print', '#6D5DFB', 'nearby', 1000, 1),
      ('community', 'found_pet', 'พบสัตว์เลี้ยง', 'paw-print', '#49B96E', 'marker', NULL, 2),
      ('community', 'lost_item', 'ของหาย', 'package-search', '#6D5DFB', 'marker', NULL, 3),
      ('community', 'found_item', 'พบของ', 'package-check', '#49B96E', 'marker', NULL, 4),
      ('community', 'dangerous_animal', 'สัตว์อันตราย', 'paw-print', '#E8333C', 'nearby', 500, 5),
      ('community', 'public_obstruction', 'สิ่งกีดขวางพื้นที่สาธารณะ', 'construction', '#F0B429', 'marker', NULL, 6)
) AS seed(category_code, type_code, type_name, icon_name, marker_color, display_mode, default_radius_m, sort_order)
JOIN tb_incident_categories category ON category.category_code = seed.category_code
ON CONFLICT (type_code) DO NOTHING;

-- เปลี่ยนชื่อ 'ไฟไหม้อาคาร' เป็น 'ไฟไหม้' ให้ Database เดิมด้วย (seed ข้างบนเป็น DO NOTHING)
UPDATE tb_incident_types
SET type_name = 'ไฟไหม้'
WHERE type_code = 'building_fire' AND type_name = 'ไฟไหม้อาคาร';

UPDATE tb_incident_types
SET is_quick = TRUE
WHERE type_code IN ('traffic_accident', 'building_fire', 'road_damage', 'pm25', 'violent_incident', 'flood');

-- คำสำคัญเริ่มต้นสำหรับการจับคู่ข้อความแบบกำหนดผลลัพธ์ได้ในรุ่นแรก
INSERT INTO tb_incident_keywords (type_id, keyword)
SELECT incident_type.type_id, seed.keyword
FROM (
    VALUES
      ('flood', 'น้ำท่วม'), ('flood', 'น้ำขัง'), ('flood', 'น้ำล้น'), ('flood', 'น้ำเอ่อ'),
      ('flash_flood', 'น้ำป่า'), ('flash_flood', 'น้ำป่าไหลหลาก'), ('flash_flood', 'น้ำหลาก'),
      ('storm', 'พายุ'), ('storm', 'ลมแรง'), ('storm', 'ฝนหนัก'),
      ('wildfire', 'ไฟป่า'), ('wildfire', 'ไฟลาม'),
      ('earthquake', 'แผ่นดินไหว'), ('earthquake', 'แรงสั่นสะเทือน'),
      ('tsunami', 'สึนามิ'), ('tsunami', 'คลื่นยักษ์'),
      ('landslide', 'ดินถล่ม'), ('landslide', 'ดินสไลด์'), ('landslide', 'โคลนถล่ม'),
      ('drought', 'ภัยแล้ง'), ('drought', 'ขาดน้ำ'),
      ('building_fire', 'ไฟไหม้'), ('building_fire', 'ไฟไหม้บ้าน'), ('building_fire', 'ไฟไหม้อาคาร'), ('building_fire', 'เพลิงไหม้'),
      ('traffic_accident', 'รถชน'), ('traffic_accident', 'รถชนกัน'), ('traffic_accident', 'อุบัติเหตุ'), ('traffic_accident', 'เฉี่ยวชน'), ('traffic_accident', 'มอเตอร์ไซค์ล้ม'),
      ('vehicle_rollover', 'รถคว่ำ'), ('vehicle_obstruction', 'รถเสีย'), ('vehicle_obstruction', 'รถกีดขวาง'),
      ('road_damage', 'ถนนทรุด'), ('road_damage', 'ถนนชำรุด'), ('road_damage', 'ถนนพัง'), ('road_damage', 'หลุม'),
      ('road_obstruction', 'ถนนกีดขวาง'), ('road_obstruction', 'กีดขวาง'), ('road_obstruction', 'ปิดถนน'),
      ('building_collapse', 'อาคารถล่ม'), ('building_collapse', 'ตึกถล่ม'),
      ('violent_incident', 'เหตุรุนแรง'), ('violent_incident', 'ทะเลาะวิวาท'), ('violent_incident', 'ทำร้าย'),
      ('missing_person', 'คนหาย'), ('missing_person', 'เด็กหาย'),
      ('suspicious_object', 'วัตถุต้องสงสัย'), ('suspicious_object', 'คนต้องสงสัย'),
      ('power_outage', 'ไฟฟ้าดับ'), ('power_outage', 'ไฟดับ'), ('power_outage', 'ไฟไม่ติด'),
      ('fallen_pole', 'เสาไฟล้ม'), ('broken_power_line', 'สายไฟขาด'), ('broken_power_line', 'ไฟฟ้ารั่ว'),
      ('water_pipe_break', 'ท่อน้ำแตก'), ('water_pipe_break', 'ท่อประปารั่ว'),
      ('water_supply_outage', 'น้ำประปาไม่ไหล'), ('water_supply_outage', 'น้ำไม่ไหล'), ('water_supply_outage', 'ประปาขัดข้อง'),
      ('pm25', 'PM2.5'), ('pm25', 'ฝุ่น'), ('pm25', 'หมอกควัน'),
      ('abnormal_smoke', 'ควันผิดปกติ'), ('air_pollution', 'มลพิษอากาศ'), ('air_pollution', 'อากาศเสีย'),
      ('wastewater', 'น้ำเสีย'), ('wastewater', 'น้ำเน่าเสีย'),
      ('chemical_odor', 'กลิ่นสารเคมี'), ('chemical_odor', 'กลิ่นแก๊ส'), ('chemical_odor', 'แก๊สรั่ว'),
      ('chemical_leak', 'สารเคมีรั่ว'), ('chemical_leak', 'สารเคมีหก'),
      ('waste', 'ขยะกอง'), ('waste', 'ขยะล้น'),
      ('missing_pet', 'หมาหาย'), ('missing_pet', 'แมวหาย'), ('missing_pet', 'สัตว์เลี้ยงหาย'),
      ('lost_item', 'ของหาย'), ('lost_item', 'ทำหาย'), ('dangerous_animal', 'สัตว์อันตราย'), ('dangerous_animal', 'งู')
) AS seed(type_code, keyword)
JOIN tb_incident_types incident_type ON incident_type.type_code = seed.type_code
ON CONFLICT (type_id, keyword) DO NOTHING;
