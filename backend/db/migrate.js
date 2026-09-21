// Migration ที่รักษาข้อมูล tb_incidents แบบเดิม ก่อนปรับเป็น Incident หลัก
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const schemaPath = path.join(__dirname, 'schema.sql');
const legacyTable = 'tb_incidents_legacy_20260921';

async function isLegacyIncidentTable(client) {
  const result = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'tb_incidents'
        AND column_name = 'category'
    ) AS is_legacy
  `);

  return result.rows[0].is_legacy;
}

async function migrateLegacyIncidents(client) {
  const hasLegacy = await client.query(
    'SELECT to_regclass($1) AS table_name',
    [`public.${legacyTable}`]
  );

  if (!hasLegacy.rows[0].table_name) return;

  // เก็บ Incident เดิมเป็น Incident หลักหนึ่งรายการต่อหนึ่งแถวเพื่อไม่ให้ข้อมูลสูญหาย
  await client.query(`
    INSERT INTO tb_incidents (
      incident_id, title, description, incident_location, display_mode, radius_m,
      severity, confidence_score, verification_status, incident_status, report_count,
      first_reported_at, last_reported_at, created_at, updated_at
    )
    SELECT
      id,
      COALESCE(NULLIF(category, ''), 'รายงานเดิม'),
      description,
      location,
      'marker',
      NULL,
      CASE LOWER(COALESCE(severity, ''))
        WHEN 'low' THEN 'low'
        WHEN 'medium' THEN 'medium'
        WHEN 'high' THEN 'high'
        WHEN 'critical' THEN 'critical'
        WHEN 'ต่ำ' THEN 'low'
        WHEN 'ปานกลาง' THEN 'medium'
        WHEN 'สูง' THEN 'high'
        WHEN 'วิกฤต' THEN 'critical'
        ELSE 'unrated'
      END,
      0,
      'unverified',
      CASE WHEN status IN ('resolved', 'closed') THEN 'resolved' ELSE 'active' END,
      1,
      COALESCE(created_at, CURRENT_TIMESTAMP),
      COALESCE(updated_at, created_at, CURRENT_TIMESTAMP),
      COALESCE(created_at, CURRENT_TIMESTAMP),
      COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
    FROM ${legacyTable}
    ON CONFLICT (incident_id) DO NOTHING
  `);

  // ย้ายแต่ละแถวเดิมเป็น Report และคง category เดิมเป็น custom_type เพื่อรอจับคู่ Type ภายหลัง
  await client.query(`
    INSERT INTO tb_incident_reports (
      user_id, incident_id, description, custom_type, type_status, incident_location,
      report_status, is_suspicious, created_at, updated_at
    )
    SELECT
      user_id,
      id,
      COALESCE(NULLIF(description, ''), 'รายงานเดิมที่ไม่มีรายละเอียด'),
      NULLIF(category, ''),
      'pending_review',
      location,
      CASE WHEN status = 'rejected' THEN 'rejected' ELSE 'linked' END,
      FALSE,
      COALESCE(created_at, CURRENT_TIMESTAMP),
      COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
    FROM ${legacyTable}
    WHERE location IS NOT NULL
  `);

  // ย้าย URL รูปเดิมจาก TEXT[] ไปเป็นแถว Media แยกตาม Report ที่เพิ่งสร้าง
  await client.query(`
    INSERT INTO tb_incident_media (report_id, media_type, media_url, created_at)
    SELECT report.report_id, 'image', media_url, report.created_at
    FROM tb_incident_reports report
    JOIN ${legacyTable} legacy
      ON report.incident_id = legacy.id
     AND report.created_at = COALESCE(legacy.created_at, report.created_at)
    CROSS JOIN LATERAL unnest(COALESCE(legacy.images, ARRAY[]::TEXT[])) AS media_url
    WHERE media_url IS NOT NULL AND media_url <> ''
  `);

  await client.query(`
    SELECT setval(pg_get_serial_sequence('tb_incidents', 'incident_id'),
      COALESCE((SELECT MAX(incident_id) FROM tb_incidents), 1), true)
  `);
}

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

    if (await isLegacyIncidentTable(client)) {
      const existingArchive = await client.query('SELECT to_regclass($1) AS table_name', [`public.${legacyTable}`]);
      if (!existingArchive.rows[0].table_name) {
        await client.query(`ALTER TABLE tb_incidents RENAME TO ${legacyTable}`);
      }
    }

    await client.query(fs.readFileSync(schemaPath, 'utf8'));
    await migrateLegacyIncidents(client);
    await client.query('COMMIT');
    console.log('ปรับ Incident schema สำเร็จ และรักษาข้อมูลเดิมไว้ในตาราง archive');
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
