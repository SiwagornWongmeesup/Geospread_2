-- GeoSpread Database Schema
-- ใช้สำหรับสร้างตารางทั้งหมดในระบบ (Source of Truth)

-- เปิดใช้งาน PostGIS Extension สำหรับจัดการพิกัดแผนที่
CREATE EXTENSION IF NOT EXISTS postgis;

-- --------------------------------------------------------
-- Table: users
-- หน้าที่: เก็บข้อมูลผู้ใช้งานระบบ
-- ฟิลด์ที่ต้องการ: id, email, password, profile, role, created_at
-- --------------------------------------------------------

-- (เดี๋ยวเราจะเขียนคำสั่ง CREATE TABLE สำหรับ users ตรงนี้)
