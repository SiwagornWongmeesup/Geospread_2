// Migration สำหรับเพิ่มสถานะปัจจุบัน, วันหมดอายุ และประวัติความคืบหน้าของ Incident Report
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE tb_incident_reports
        ADD COLUMN IF NOT EXISTS event_status VARCHAR(20) NOT NULL DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    `);

    await client.query('ALTER TABLE tb_incident_reports DROP CONSTRAINT IF EXISTS chk_report_event_status');
    await client.query(`
      ALTER TABLE tb_incident_reports
        ADD CONSTRAINT chk_report_event_status
        CHECK (event_status IN ('active', 'improving', 'resolved', 'expired'))
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tb_incident_report_updates (
        report_update_id SERIAL PRIMARY KEY,
        report_id INT NOT NULL REFERENCES tb_incident_reports(report_id) ON DELETE CASCADE,
        user_id INT REFERENCES tb_users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        status_after VARCHAR(20) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_report_update_message CHECK (char_length(trim(message)) BETWEEN 1 AND 1000),
        CONSTRAINT chk_report_update_status CHECK (status_after IN ('active', 'improving', 'resolved', 'expired'))
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_event_status_expiry
        ON tb_incident_reports(event_status, expires_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_report_updates_report_created
        ON tb_incident_report_updates(report_id, created_at DESC)
    `);

    await client.query('COMMIT');
    console.log('เพิ่ม lifecycle และประวัติความคืบหน้าของ Incident Report สำเร็จ');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('เพิ่ม lifecycle ของ Incident Report ไม่สำเร็จ:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
