// backend/db/migrate.js
// สคริปต์สำหรับรัน Database Migration / ALTER TABLE เพิ่มเติมโดยไม่ลบตารางเดิม
require('dotenv').config();
const { pool } = require('./db');

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('⏳ กำลังรัน Migration...');

        // 📝 คำสั่ง SQL สำหรับสร้างหรืออัปเดตตารางในระบบ
        const sql = `
            CREATE EXTENSION IF NOT EXISTS postgis;

            -- เปลี่ยนชื่อตารางเดิมถ้ามีอยู่
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
                    ALTER TABLE users RENAME TO tb_users;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'incidents') THEN
                    ALTER TABLE incidents RENAME TO tb_incidents;
                END IF;
            END $$;

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

            ALTER TABLE tb_users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
            ADD COLUMN IF NOT EXISTS profile TEXT,
            ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 100;

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

            CREATE INDEX IF NOT EXISTS idx_incidents_location 
            ON tb_incidents USING GIST (location);

            CREATE INDEX IF NOT EXISTS idx_incidents_status 
            ON tb_incidents (status) WHERE deleted_at IS NULL;
        `;

        await client.query(sql);
        console.log('✅ ปรับปรุงโครงสร้างฐานข้อมูลสำเร็จ (Migration Succeeded)!');
    } catch (err) {
        console.error('❌ เกิดข้อผิดพลาดในการรัน SQL:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
