// Migration สำหรับอายุของเหตุการณ์บนแผนที่
// เหตุหมดอายุเมื่อ last_reported_at + default_expiry_hours ของประเภทนั้นผ่านไปแล้ว
// คำนวณตอนดึงข้อมูล ไม่เก็บเป็นคอลัมน์ เพื่อให้อายุต่อเองทุกครั้งที่มีรายงานใหม่เข้าเหตุเดิม
require("dotenv").config();
const { pool } = require("./db");

const runMigration = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE tb_incident_types
        ADD COLUMN IF NOT EXISTS default_expiry_hours INT NOT NULL DEFAULT 24
    `);
    await client.query(
      "ALTER TABLE tb_incident_types DROP CONSTRAINT IF EXISTS chk_incident_type_expiry_hours",
    );
    await client.query(`
      ALTER TABLE tb_incident_types
        ADD CONSTRAINT chk_incident_type_expiry_hours
        CHECK (default_expiry_hours BETWEEN 1 AND 720)
    `);

    // อายุตามประเภท (ชั่วโมง) ประเภทที่ไม่อยู่ในรายการนี้ใช้ค่าเริ่มต้น 24 ชั่วโมง
    await client.query(`
      UPDATE tb_incident_types SET default_expiry_hours = CASE
        WHEN type_code IN ('traffic_accident', 'vehicle_rollover', 'vehicle_obstruction', 'other_road_accident') THEN 6
        WHEN type_code IN ('building_fire', 'other_fire', 'abnormal_smoke') THEN 12
        WHEN type_code IN ('flood', 'flash_flood', 'landslide', 'wildfire', 'pm25', 'drought') THEN 72
        ELSE default_expiry_hours
      END
    `);

    await client.query("COMMIT");
    console.log("เพิ่มอายุของเหตุการณ์ตามประเภทสำเร็จ");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("เพิ่มอายุของเหตุการณ์ไม่สำเร็จ:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
