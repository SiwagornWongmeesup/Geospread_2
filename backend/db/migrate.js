// backend/db/migrate.js
// สคริปต์สำหรับรัน Database Migration / ALTER TABLE เพิ่มเติมโดยไม่ลบตารางเดิม
require('dotenv').config();
const { pool } = require('./db');

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('⏳ กำลังรัน Migration...');

        // 📝 ใส่คำสั่ง SQL ที่ต้องการรันในบล็อกนี้
        const sql = `
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
            ADD COLUMN IF NOT EXISTS profile TEXT;
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
