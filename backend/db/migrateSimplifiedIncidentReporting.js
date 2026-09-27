// Migration แบบปลอดภัยสำหรับ flow แจ้งเหตุแบบง่าย: Boolean matching และ Candidate ระดับ Report
require('dotenv').config();
const { pool } = require('./db');

const quickTypeCodes = [
  'traffic_accident',
  'building_fire',
  'road_damage',
  'pm25',
  'violent_incident',
  'flood',
];

const archiveOrRemoveLegacyCandidates = async (client) => {
  const existing = await client.query("SELECT to_regclass('public.tb_incident_merge_candidates') AS table_name");
  if (!existing.rows[0].table_name) return;

  const countResult = await client.query('SELECT COUNT(*)::int AS count FROM tb_incident_merge_candidates');
  if (countResult.rows[0].count === 0) {
    await client.query('DROP TABLE tb_incident_merge_candidates');
    return;
  }

  const archive = await client.query("SELECT to_regclass('public.tb_incident_merge_candidates_legacy_20260924') AS table_name");
  if (!archive.rows[0].table_name) {
    await client.query('ALTER TABLE tb_incident_merge_candidates RENAME TO tb_incident_merge_candidates_legacy_20260924');
  }
};

const applySimplifiedIncidentReportingSchema = async (client) => {
  await client.query(`
    ALTER TABLE tb_incident_reports
      ADD COLUMN IF NOT EXISTS reporter_trust_score INT NOT NULL DEFAULT 100
  `);
  await client.query(`
    ALTER TABLE tb_incidents
      ADD COLUMN IF NOT EXISTS merged_into_incident_id INT
        REFERENCES tb_incidents(incident_id) ON DELETE SET NULL
  `);
  await client.query(`
    ALTER TABLE tb_incident_types
      ADD COLUMN IF NOT EXISTS is_quick BOOLEAN NOT NULL DEFAULT FALSE
  `);
  await client.query(
    'UPDATE tb_incident_types SET is_quick = TRUE WHERE type_code = ANY($1::text[])',
    [quickTypeCodes],
  );

  await client.query("UPDATE tb_incidents SET incident_status = 'resolved' WHERE incident_status IN ('closed', 'merged')");
  await client.query('ALTER TABLE tb_incidents DROP CONSTRAINT IF EXISTS chk_incident_status');
  await client.query(`
    ALTER TABLE tb_incidents
      ADD CONSTRAINT chk_incident_status
      CHECK (incident_status IN ('active', 'resolved'))
  `);

  // report_status คือสถานะตรวจสอบ ไม่ใช่สถานะการเชื่อม Incident
  await client.query(`
    UPDATE tb_incident_reports
    SET report_status = CASE WHEN report_status = 'rejected' THEN 'rejected' ELSE 'pending' END
    WHERE report_status NOT IN ('pending', 'verified', 'rejected')
  `);
  await client.query('ALTER TABLE tb_incident_reports DROP CONSTRAINT IF EXISTS chk_report_status');
  await client.query(`
    ALTER TABLE tb_incident_reports
      ADD CONSTRAINT chk_report_status
      CHECK (report_status IN ('pending', 'verified', 'rejected'))
  `);
  await client.query("UPDATE tb_incident_reports SET type_status = 'pending' WHERE type_status = 'pending_review'");
  await client.query('ALTER TABLE tb_incident_reports DROP CONSTRAINT IF EXISTS chk_report_type_status');
  await client.query(`
    ALTER TABLE tb_incident_reports
      ADD CONSTRAINT chk_report_type_status
      CHECK (type_status IN ('confirmed', 'pending', 'conflict'))
  `);

  await archiveOrRemoveLegacyCandidates(client);

  await client.query(`
    CREATE TABLE IF NOT EXISTS tb_incident_report_candidates (
      candidate_id SERIAL PRIMARY KEY,
      report_id INT NOT NULL UNIQUE REFERENCES tb_incident_reports(report_id) ON DELETE CASCADE,
      target_incident_id INT NOT NULL REFERENCES tb_incidents(incident_id),
      distance_m NUMERIC(10, 2) NOT NULL,
      time_difference_minutes NUMERIC(10, 2) NOT NULL,
      candidate_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      decided_by INT REFERENCES tb_users(id) ON DELETE SET NULL,
      decision_note TEXT,
      decided_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chk_report_candidate_measurements CHECK (distance_m >= 0 AND time_difference_minutes >= 0),
      CONSTRAINT chk_report_candidate_status CHECK (candidate_status IN ('pending', 'accepted', 'rejected'))
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS tb_incident_candidate_groups (
      candidate_group_id SERIAL PRIMARY KEY,
      anchor_report_id INT NOT NULL REFERENCES tb_incident_reports(report_id) ON DELETE RESTRICT,
      candidate_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      decided_by INT REFERENCES tb_users(id) ON DELETE SET NULL,
      decision_note TEXT,
      decided_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chk_candidate_group_status CHECK (candidate_status IN ('pending', 'accepted', 'rejected'))
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS tb_incident_candidate_group_reports (
      candidate_group_id INT NOT NULL REFERENCES tb_incident_candidate_groups(candidate_group_id) ON DELETE CASCADE,
      report_id INT NOT NULL UNIQUE REFERENCES tb_incident_reports(report_id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (candidate_group_id, report_id)
    )
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_report_candidates_pending_target
      ON tb_incident_report_candidates(target_incident_id, created_at DESC)
      WHERE candidate_status = 'pending'
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_candidate_groups_pending
      ON tb_incident_candidate_groups(created_at DESC)
      WHERE candidate_status = 'pending'
  `);
};

const runMigration = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await applySimplifiedIncidentReportingSchema(client);
    await client.query('COMMIT');
    console.log('ปรับ schema สำหรับ Incident matching แบบง่ายสำเร็จ');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ปรับ schema สำหรับ Incident matching ไม่สำเร็จ:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
