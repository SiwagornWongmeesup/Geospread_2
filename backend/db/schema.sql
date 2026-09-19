-- GeoSpread Database Schema
-- ใช้สำหรับสร้างตารางทั้งหมดในระบบ (Source of Truth)

-- เปิดใช้งาน PostGIS Extension สำหรับจัดการพิกัดแผนที่
CREATE EXTENSION IF NOT EXISTS postgis;

-- --------------------------------------------------------
-- Table: tb_users
-- หน้าที่: เก็บข้อมูลผู้ใช้งานระบบ
-- ฟิลด์ที่ต้องการ: id, email, password, profile, role, created_at
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tb_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(50),
    lastname VARCHAR(50),
    profile TEXT,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    trust_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- --------------------------------------------------------
-- Table: tb_incidents
-- หน้าที่: เก็บรายงานเหตุการณ์ย่อยจากชุมชน
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tb_incidents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES tb_users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    images TEXT[],
    location GEOMETRY(Point, 4326) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Spatial Index สำหรับค้นหาเหตุการณ์ตามพิกัดและระยะทาง (ST_DWithin)
CREATE INDEX IF NOT EXISTS idx_incidents_location 
ON tb_incidents USING GIST (location);

-- Index สำหรับค้นหาเฉพาะเหตุการณ์ที่ยังไม่ถูกลบ (Soft Delete)
CREATE INDEX IF NOT EXISTS idx_incidents_status 
ON tb_incidents (status) WHERE deleted_at IS NULL;

