-- GeoSpread Database Schema
-- ใช้สำหรับสร้างตารางทั้งหมดในระบบ (Source of Truth)

-- เปิดใช้งาน PostGIS Extension สำหรับจัดการพิกัดแผนที่
CREATE EXTENSION IF NOT EXISTS postgis;

-- --------------------------------------------------------
-- Table: users
-- หน้าที่: เก็บข้อมูลผู้ใช้งานระบบ
-- ฟิลด์ที่ต้องการ: id, email, password, profile, role, created_at
-- --------------------------------------------------------

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(50),
    lastname VARCHAR(50),
    profile TEXT,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);
