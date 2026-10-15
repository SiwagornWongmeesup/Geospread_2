// Migration สำหรับคำขอความช่วยเหลือและประวัติความคืบหน้า; ทุกคำขอเป็น record แยก ไม่ merge กัน
require('dotenv').config();
const { pool } = require('./db');

const runMigration = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tb_help_requests (
        help_request_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES tb_users(id) ON DELETE SET NULL,
        help_type VARCHAR(30) NOT NULL,
        related_disaster VARCHAR(50),
        custom_help_type VARCHAR(255),
        description TEXT NOT NULL,
        people_count SMALLINT NOT NULL DEFAULT 1,
        help_location GEOMETRY(Point, 4326) NOT NULL,
        location_source VARCHAR(20) NOT NULL DEFAULT 'unknown',
        reporter_location GEOMETRY(Point, 4326),
        reporter_accuracy_m NUMERIC(10, 2),
        reporter_captured_at TIMESTAMPTZ,
        request_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        accepted_by INT REFERENCES tb_users(id) ON DELETE SET NULL,
        accepted_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_help_request_type CHECK (help_type IN ('evacuation', 'medical', 'food', 'shelter', 'vehicle', 'other')),
        CONSTRAINT chk_help_request_people CHECK (people_count >= 1 AND people_count <= 999),
        CONSTRAINT chk_help_request_location_source CHECK (location_source IN ('device', 'map', 'unknown')),
        CONSTRAINT chk_help_request_accuracy CHECK (reporter_accuracy_m IS NULL OR reporter_accuracy_m >= 0),
        CONSTRAINT chk_help_request_status CHECK (request_status IN ('pending', 'accepted', 'in_progress', 'resolved', 'cancelled', 'expired'))
      )
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'tb_help_requests' AND column_name = 'custom_type'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'tb_help_requests' AND column_name = 'custom_help_type'
        ) THEN
          ALTER TABLE tb_help_requests RENAME COLUMN custom_type TO custom_help_type;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tb_help_request_updates (
        help_request_update_id SERIAL PRIMARY KEY,
        help_request_id INT NOT NULL REFERENCES tb_help_requests(help_request_id) ON DELETE CASCADE,
        user_id INT REFERENCES tb_users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        status_after VARCHAR(20) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_help_request_update_message CHECK (char_length(trim(message)) BETWEEN 1 AND 1000),
        CONSTRAINT chk_help_request_update_status CHECK (status_after IN ('pending', 'accepted', 'in_progress', 'resolved', 'cancelled', 'expired'))
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_help_requests_location ON tb_help_requests USING GIST (help_location)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_help_requests_status_expiry ON tb_help_requests(request_status, expires_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_help_request_updates_request_created ON tb_help_request_updates(help_request_id, created_at DESC)');

    await client.query('COMMIT');
    console.log('เพิ่มตารางคำขอความช่วยเหลือและประวัติความคืบหน้าสำเร็จ');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('เพิ่มตารางคำขอความช่วยเหลือไม่สำเร็จ:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
