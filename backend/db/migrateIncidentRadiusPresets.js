// ปรับ preset การแสดงรัศมีของ Incident Type และ sync Incident เดิมให้หน้าบ้านใช้ค่าชุดใหม่
require('dotenv').config();
const { pool } = require('./db');

const typeDisplayPresets = [
  { code: 'road_damage', mode: 'marker', radius: null },
  { code: 'waste', mode: 'marker', radius: null },
  { code: 'found_pet', mode: 'marker', radius: null },
  { code: 'lost_item', mode: 'marker', radius: null },
  { code: 'found_item', mode: 'marker', radius: null },
  { code: 'public_obstruction', mode: 'marker', radius: null },

  { code: 'fallen_pole', mode: 'nearby', radius: 200 },
  { code: 'broken_power_line', mode: 'nearby', radius: 200 },
  { code: 'water_pipe_break', mode: 'nearby', radius: 200 },

  { code: 'vehicle_obstruction', mode: 'nearby', radius: 300 },
  { code: 'conflict', mode: 'nearby', radius: 300 },

  { code: 'traffic_accident', mode: 'nearby', radius: 500 },
  { code: 'vehicle_rollover', mode: 'nearby', radius: 500 },
  { code: 'road_obstruction', mode: 'nearby', radius: 500 },
  { code: 'bridge_damage', mode: 'nearby', radius: 500 },
  { code: 'building_fire', mode: 'nearby', radius: 500 },
  { code: 'building_collapse', mode: 'nearby', radius: 500 },
  { code: 'suspicious_object', mode: 'nearby', radius: 500 },
  { code: 'dangerous_animal', mode: 'nearby', radius: 500 },

  { code: 'abnormal_smoke', mode: 'nearby', radius: 1000 },
  { code: 'chemical_odor', mode: 'nearby', radius: 1000 },
  { code: 'chemical_leak', mode: 'nearby', radius: 1000 },
  { code: 'landslide', mode: 'area', radius: 1000 },
  { code: 'other_fire', mode: 'nearby', radius: 1000 },

  { code: 'missing_pet', mode: 'nearby', radius: 1000 },
  { code: 'missing_person', mode: 'nearby', radius: 2000 },

  { code: 'flood', mode: 'area', radius: 3000 },
  { code: 'flash_flood', mode: 'area', radius: 3000 },

  { code: 'storm', mode: 'marker', radius: null },
  { code: 'earthquake', mode: 'marker', radius: null },
  { code: 'drought', mode: 'marker', radius: null },
  { code: 'pm25', mode: 'marker', radius: null },
  { code: 'air_pollution', mode: 'marker', radius: null },
  { code: 'power_outage', mode: 'marker', radius: null },
  { code: 'water_supply_outage', mode: 'marker', radius: null },
  { code: 'tsunami', mode: 'marker', radius: null },
];

const buildValuesSql = () => typeDisplayPresets
  .map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3}::int)`)
  .join(',\n      ');

const presetParams = () => typeDisplayPresets.flatMap((preset) => [
  preset.code,
  preset.mode,
  preset.radius,
]);

const applyIncidentRadiusPresets = async (client) => {
  const valuesSql = buildValuesSql();
  const params = presetParams();

  await client.query(`
    WITH presets(type_code, display_mode, default_radius_m) AS (
      VALUES
      ${valuesSql}
    )
    UPDATE tb_incident_types incident_type
    SET display_mode = presets.display_mode,
        default_radius_m = presets.default_radius_m,
        updated_at = CURRENT_TIMESTAMP
    FROM presets
    WHERE incident_type.type_code = presets.type_code
  `, params);

  await client.query(`
    WITH presets(type_code, display_mode, default_radius_m) AS (
      VALUES
      ${valuesSql}
    )
    UPDATE tb_incidents incident
    SET display_mode = presets.display_mode,
        radius_m = presets.default_radius_m,
        updated_at = CURRENT_TIMESTAMP
    FROM tb_incident_types incident_type
    JOIN presets ON presets.type_code = incident_type.type_code
    WHERE incident.final_type_id = incident_type.type_id
  `, params);
};

const runMigration = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await applyIncidentRadiusPresets(client);
    await client.query('COMMIT');
    console.log('ปรับ Incident radius presets สำเร็จ');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ปรับ Incident radius presets ไม่สำเร็จ:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
