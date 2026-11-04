// Migration สำหรับระบบยืนยันอีเมลด้วยรหัส 6 หลัก
// บัญชีที่มีอยู่แล้วจะถือว่ายืนยันอีเมลแล้ว บัญชีที่สมัครหลังจากนี้ต้องยืนยันก่อนเข้าสู่ระบบ
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('ALTER TABLE tb_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE');
    await client.query('ALTER TABLE tb_users ALTER COLUMN email_verified SET DEFAULT FALSE');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tb_email_verifications (
        user_id INT PRIMARY KEY REFERENCES tb_users(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts SMALLINT NOT NULL DEFAULT 0,
        last_sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('เพิ่มระบบยืนยันอีเมลสำเร็จ (บัญชีเดิมถือว่ายืนยันแล้ว)');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('เกิดข้อผิดพลาดในการรัน migration:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
