const db = require('../../db/db');

// บันทึกข้อมูลดิบที่ผู้ใช้รายงาน โดยไม่บังคับ Type หรือ Severity
const createIncidentReport = async (reportData) => {
    const {
        user_id,
        description,
        user_selected_type_id = null,
        system_suggested_type_id = null,
        final_type_id = null,
        custom_type = null,
        lat,
        lng,
        reporter_lat = null,
        reporter_lng = null
    } = reportData;

    const result = await db.query(
        `INSERT INTO tb_incident_reports (
            user_id, description, user_selected_type_id, system_suggested_type_id,
            final_type_id, custom_type, type_status, incident_location,
            reporter_location, distance_from_reporter
        )
        VALUES (
            $1, $2, $3, $4, $5, $6,
            CASE WHEN $5 IS NULL THEN 'pending' ELSE 'confirmed' END,
            ST_SetSRID(ST_MakePoint($7, $8), 4326),
            CASE WHEN $9::numeric IS NULL OR $10::numeric IS NULL THEN NULL
                 ELSE ST_SetSRID(ST_MakePoint($9, $10), 4326)
            END,
            CASE WHEN $9::numeric IS NULL OR $10::numeric IS NULL THEN NULL
                 ELSE ST_Distance(
                    ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography,
                    ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography
                 )
            END
        )
        RETURNING
            report_id,
            incident_id,
            description,
            user_selected_type_id,
            system_suggested_type_id,
            final_type_id,
            custom_type,
            type_status,
            report_status,
            is_suspicious,
            ST_X(incident_location) AS lng,
            ST_Y(incident_location) AS lat,
            distance_from_reporter,
            created_at`,
        [
            user_id,
            description,
            user_selected_type_id,
            system_suggested_type_id,
            final_type_id,
            custom_type,
            lng,
            lat,
            reporter_lng,
            reporter_lat
        ]
    );

    return result.rows[0];
};

module.exports = {
    createIncidentReport,
    createIncident: createIncidentReport
};
