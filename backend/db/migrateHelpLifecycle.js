// Migration: วงจรคำขอความช่วยเหลือหลังรับข้อเสนอ + รายงานผู้ใช้
// - tb_help_requests: ผู้ขอเลือกแชร์เบอร์ / LINE ให้ผู้ช่วย, เวลาที่ยกเลิก
// - tb_help_offers: สถานะใหม่ withdrawn (ผู้ช่วยถอนตัว), released (ผู้ขอปลดผู้ช่วย)
// - tb_user_reports: รายงานผู้ใช้ที่น่าสงสัย เช่น ขอเงิน ไม่มาตามนัด
// รัน: node db/migrateHelpLifecycle.js
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  try {
    await pool.query(`
      ALTER TABLE tb_help_requests
        ADD COLUMN IF NOT EXISTS share_phone BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS share_line BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

      ALTER TABLE tb_help_offers DROP CONSTRAINT IF EXISTS chk_help_offer_status;
      ALTER TABLE tb_help_offers ADD CONSTRAINT chk_help_offer_status
        CHECK (offer_status IN ('pending', 'accepted', 'declined', 'withdrawn', 'released'));

      CREATE TABLE IF NOT EXISTS tb_user_reports (
        report_id SERIAL PRIMARY KEY,
        reporter_id INT NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
        reported_user_id INT NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
        help_request_id INT REFERENCES tb_help_requests(help_request_id) ON DELETE SET NULL,
        reason VARCHAR(30) NOT NULL,
        details TEXT,
        report_status VARCHAR(20) NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_user_report UNIQUE (reporter_id, reported_user_id, help_request_id),
        CONSTRAINT chk_user_report_reason CHECK (reason IN ('asked_money', 'no_show', 'fake_request', 'harassment', 'other')),
        CONSTRAINT chk_user_report_details CHECK (details IS NULL OR char_length(details) <= 500),
        CONSTRAINT chk_user_report_status CHECK (report_status IN ('open', 'reviewed'))
      );

      CREATE INDEX IF NOT EXISTS idx_help_offers_helper ON tb_help_offers(helper_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_help_requests_user ON tb_help_requests(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON tb_user_reports(reported_user_id, created_at DESC);
    `);
    console.log('อัปเดตตารางคำขอความช่วยเหลือ และเพิ่ม tb_user_reports สำเร็จ');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการรัน migration:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runMigration();
