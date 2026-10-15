// Migration สำหรับเก็บการแจ้งจากชุมชนว่า Incident อาจเป็นข้อมูลเท็จ
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tb_incident_false_reports (
        false_report_id SERIAL PRIMARY KEY,
        incident_id INT NOT NULL REFERENCES tb_incidents(incident_id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_false_report_per_user UNIQUE (incident_id, user_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_false_reports_incident_created
        ON tb_incident_false_reports(incident_id, created_at DESC)
    `);
    await client.query('COMMIT');
    console.log('เพิ่มตารางรายงานเหตุการณ์เท็จสำเร็จ');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('เพิ่มตารางรายงานเหตุการณ์เท็จไม่สำเร็จ:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
