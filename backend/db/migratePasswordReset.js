// Migration สำหรับระบบลืมรหัสผ่าน (รหัส 6 หลักทางอีเมล)
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tb_password_resets (
        user_id INT PRIMARY KEY REFERENCES tb_users(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts SMALLINT NOT NULL DEFAULT 0,
        last_sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('เพิ่มตารางรีเซ็ตรหัสผ่านสำเร็จ');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการรัน migration:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runMigration();
