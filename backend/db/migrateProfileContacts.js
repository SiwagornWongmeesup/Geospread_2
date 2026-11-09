// Migration: เพิ่มช่อง LINE ID และ Instagram ให้ผู้ใช้กรอกในหน้าโปรไฟล์
// รัน: node db/migrateProfileContacts.js
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  try {
    await pool.query(`
      ALTER TABLE tb_users ADD COLUMN IF NOT EXISTS line_id VARCHAR(20);
      ALTER TABLE tb_users ADD COLUMN IF NOT EXISTS instagram VARCHAR(30);
    `);
    console.log('เพิ่มช่อง line_id และ instagram ในตาราง tb_users สำเร็จ');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการรัน migration:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runMigration();
