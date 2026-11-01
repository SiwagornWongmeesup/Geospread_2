// Migration ปรับข้อมูลเก่า: Incident ที่มี Report ถูกแอดมินยืนยันแล้ว ให้ verification_status = 'verified'
// (ก่อนหน้านี้การยืนยันเปลี่ยนแค่ report_status ของ Report ไม่ได้เปลี่ยนสถานะของ Incident)
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(`
      UPDATE tb_incidents incident
         SET verification_status = 'verified',
             updated_at = CURRENT_TIMESTAMP
       WHERE incident.verification_status <> 'verified'
         AND EXISTS (
           SELECT 1
             FROM tb_incident_reports report
            WHERE report.incident_id = incident.incident_id
              AND report.report_status = 'verified'
         )
    `);
    await client.query('COMMIT');
    console.log(`ปรับสถานะ Incident เป็นยืนยันแล้ว ${result.rowCount} รายการ`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ปรับสถานะ Incident ไม่สำเร็จ:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
