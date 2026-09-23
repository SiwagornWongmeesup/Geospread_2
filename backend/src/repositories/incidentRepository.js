const db = require('../../db/db');

// บันทึกข้อมูลดิบที่ผู้ใช้รายงาน โดยไม่บังคับ Type หรือ Severity
const createIncidentReport = async (reportData, queryable = db) => {
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

    const result = await queryable.query(
        `INSERT INTO tb_incident_reports (
            user_id, description, user_selected_type_id, system_suggested_type_id,
            final_type_id, custom_type, type_status, incident_location,
            reporter_location, distance_from_reporter
        )
        VALUES (
            $1, $2, $3, $4, $5, $6,
            CASE WHEN $5::integer IS NULL THEN 'pending' ELSE 'confirmed' END,
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

// Report และ metadata ของไฟล์แนบต้องสำเร็จพร้อมกัน หรือไม่บันทึกทั้งคู่
const createIncidentReportWithMedia = async ({ reportData, media = [] }) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        const report = await createIncidentReport(reportData, client);
        const savedMedia = [];

        for (const file of media) {
            const result = await client.query(
                `INSERT INTO tb_incident_media (report_id, media_type, media_url)
                 VALUES ($1, $2, $3)
                 RETURNING media_id, report_id, media_type, media_url, created_at`,
                [report.report_id, file.media_type, file.media_url],
            );
            savedMedia.push(result.rows[0]);
        }

        await client.query('COMMIT');
        return {
            ...report,
            media: savedMedia,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// คืนประเภทที่มี keyword อยู่ในข้อความ โดยให้คำที่เฉพาะเจาะจงกว่ามาก่อน
const findSuggestedTypes = async (description, limit) => {
    const result = await db.query(
        `WITH matching_keywords AS (
            SELECT
                keyword.type_id,
                MAX(CHAR_LENGTH(keyword.keyword)) AS matched_keyword_length
            FROM tb_incident_keywords keyword
            WHERE keyword.is_active = TRUE
              AND POSITION(LOWER(keyword.keyword) IN LOWER($1)) > 0
            GROUP BY keyword.type_id
        )
        SELECT
            incident_type.type_id,
            incident_type.type_code,
            incident_type.type_name,
            incident_type.icon_name,
            incident_type.marker_color,
            incident_type.display_mode,
            incident_type.default_radius_m,
            category.category_id,
            category.category_code,
            category.category_name
        FROM matching_keywords
        JOIN tb_incident_types incident_type ON incident_type.type_id = matching_keywords.type_id
        JOIN tb_incident_categories category ON category.category_id = incident_type.category_id
        WHERE incident_type.is_active = TRUE
          AND category.is_active = TRUE
        ORDER BY matching_keywords.matched_keyword_length DESC, incident_type.sort_order, incident_type.type_id
        LIMIT $2`,
        [description, limit]
    );

    return result.rows;
};

const findActiveIncidentTypeIds = async (typeIds) => {
    const result = await db.query(
        `SELECT type_id
         FROM tb_incident_types
         WHERE is_active = TRUE
           AND type_id = ANY($1::int[])`,
        [typeIds],
    );

    return result.rows.map((row) => row.type_id);
};

// catalog สำหรับหน้าเลือกประเภท: แหล่งข้อมูลเดียวคือ Category และ Type ที่ active ในฐานข้อมูล
const findActiveIncidentCatalogRows = async () => {
    const result = await db.query(
        `SELECT
            category.category_id,
            category.category_code,
            category.category_name,
            category.icon_name AS category_icon_name,
            category.sort_order AS category_sort_order,
            incident_type.type_id,
            incident_type.type_code,
            incident_type.type_name,
            incident_type.icon_name AS type_icon_name,
            incident_type.marker_color,
            incident_type.display_mode,
            incident_type.default_radius_m,
            incident_type.sort_order AS type_sort_order
        FROM tb_incident_categories category
        JOIN tb_incident_types incident_type ON incident_type.category_id = category.category_id
        WHERE category.is_active = TRUE
          AND incident_type.is_active = TRUE
        ORDER BY category.sort_order, category.category_id, incident_type.sort_order, incident_type.type_id`
    );

    return result.rows;
};

module.exports = {
    createIncidentReport,
    createIncident: createIncidentReport,
    createIncidentReportWithMedia,
    findSuggestedTypes,
    findActiveIncidentTypeIds,
    findActiveIncidentCatalogRows,
};
