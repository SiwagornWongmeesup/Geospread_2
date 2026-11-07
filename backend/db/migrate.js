// Migration หลัก: สร้างและปรับตารางทั้งหมดตาม schema.sql
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const schemaPath = path.join(__dirname, 'schema.sql');

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('กำลังรัน Incident schema migration...');
    await client.query('BEGIN');

    const legacyUsers = await client.query("SELECT to_regclass('public.users') AS table_name");
    const currentUsers = await client.query("SELECT to_regclass('public.tb_users') AS table_name");
    if (legacyUsers.rows[0].table_name && !currentUsers.rows[0].table_name) {
      await client.query('ALTER TABLE users RENAME TO tb_users');
    }

    await client.query(fs.readFileSync(schemaPath, 'utf8'));
    await client.query('COMMIT');
    console.log('ปรับ Incident schema สำเร็จ');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('เกิดข้อผิดพลาดในการรัน migration:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
