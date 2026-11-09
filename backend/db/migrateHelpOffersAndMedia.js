// Migration: รูปของคำขอความช่วยเหลือ และข้อเสนอช่วยเหลือ
// รัน: node db/migrateHelpOffersAndMedia.js
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tb_help_request_media (
        media_id SERIAL PRIMARY KEY,
        help_request_id INT NOT NULL REFERENCES tb_help_requests(help_request_id) ON DELETE CASCADE,
        media_type VARCHAR(20) NOT NULL DEFAULT 'image',
        media_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_help_media_type CHECK (media_type IN ('image'))
      );

      CREATE TABLE IF NOT EXISTS tb_help_offers (
        offer_id SERIAL PRIMARY KEY,
        help_request_id INT NOT NULL REFERENCES tb_help_requests(help_request_id) ON DELETE CASCADE,
        helper_id INT NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
        message TEXT,
        offer_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_help_offer_helper UNIQUE (help_request_id, helper_id),
        CONSTRAINT chk_help_offer_status CHECK (offer_status IN ('pending', 'accepted', 'declined')),
        CONSTRAINT chk_help_offer_message CHECK (message IS NULL OR char_length(message) <= 500)
      );

      CREATE INDEX IF NOT EXISTS idx_help_request_media_request ON tb_help_request_media(help_request_id);
      CREATE INDEX IF NOT EXISTS idx_help_offers_request ON tb_help_offers(help_request_id, created_at);
    `);
    console.log('เพิ่มตาราง tb_help_request_media และ tb_help_offers สำเร็จ');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการรัน migration:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runMigration();
