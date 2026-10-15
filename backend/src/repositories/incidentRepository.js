const db = require('../../db/db');

const configuredPositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// เก็บเป็น config เพื่อปรับหลัง MVP ได้ โดยไม่ทำให้ matching มีหลายระดับหรือมีคะแนน
const matchingConfig = {
    distanceMeters: configuredPositiveInteger(process.env.INCIDENT_MATCH_DISTANCE_M, 300),
    timeMinutes: configuredPositiveInteger(process.env.INCIDENT_MATCH_TIME_MINUTES, 30),
};

// บันทึกข้อมูลดิบที่ผู้ใช้รายงาน โดยไม่บังคับ Type หรือ Severity
const createIncidentReport = async (reportData, queryable = db) => {
    const {
        user_id,
        reporter_trust_score = 100,
        incident_id,
        description,
        user_selected_type_id = null,
        system_suggested_type_id = null,
        final_type_id = null,
        type_status = final_type_id ? 'confirmed' : 'pending',
        report_status = 'pending',
        lat,
        lng,
        incident_source = 'unknown',
        reporter_lat = null,
        reporter_lng = null,
        reporter_accuracy_m = null,
        reporter_captured_at = null
    } = reportData;

    const result = await queryable.query(
        `INSERT INTO tb_incident_reports (
            user_id, reporter_trust_score, incident_id, description,
            user_selected_type_id, system_suggested_type_id, final_type_id,
            type_status, report_status, incident_location, incident_location_source,
            reporter_location, reporter_accuracy_m, reporter_captured_at, distance_from_reporter
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            ST_SetSRID(ST_MakePoint($10, $11), 4326), $12,
            CASE WHEN $13::numeric IS NULL OR $14::numeric IS NULL THEN NULL
                 ELSE ST_SetSRID(ST_MakePoint($13, $14), 4326)
            END,
            $15, $16,
            CASE WHEN $13::numeric IS NULL OR $14::numeric IS NULL THEN NULL
                 ELSE ST_Distance(
                    ST_SetSRID(ST_MakePoint($10, $11), 4326)::geography,
                    ST_SetSRID(ST_MakePoint($13, $14), 4326)::geography
                 )
            END
        )
        RETURNING
            report_id,
            incident_id,
            description,
            reporter_trust_score,
            user_selected_type_id,
            system_suggested_type_id,
            final_type_id,
            type_status,
            report_status,
            is_suspicious,
            ST_X(incident_location) AS lng,
            ST_Y(incident_location) AS lat,
            incident_location_source,
            reporter_accuracy_m,
            reporter_captured_at,
            distance_from_reporter,
            created_at`,
        [
            user_id,
            reporter_trust_score,
            incident_id,
            description,
            user_selected_type_id,
            system_suggested_type_id,
            final_type_id,
            type_status,
            report_status,
            lng,
            lat,
            incident_source,
            reporter_lng,
            reporter_lat,
            reporter_accuracy_m,
            reporter_captured_at
        ]
    );

    return result.rows[0];
};

const createInitialIncident = async (incidentData, queryable = db) => {
    const {
        final_type_id = null,
        title,
        description,
        lat,
        lng,
        display_mode,
        radius_m = null,
        report_count = 1,
    } = incidentData;

    const result = await queryable.query(
        `INSERT INTO tb_incidents (
            final_type_id, title, description, incident_location,
            display_mode, radius_m, report_count
        )
        VALUES (
            $1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326),
            $6, $7, $8
        )
        RETURNING
            incident_id,
            final_type_id,
            title,
            description,
            ST_X(incident_location) AS lng,
            ST_Y(incident_location) AS lat,
            display_mode,
            radius_m,
            severity,
            confidence_score,
            verification_status,
            incident_status,
            report_count,
            first_reported_at,
            last_reported_at,
            created_at`,
        [final_type_id, title, description, lng, lat, display_mode, radius_m, report_count],
    );

    return result.rows[0];
};

const getReporterTrustScore = async (userId, queryable = db) => {
    const result = await queryable.query(
        `SELECT COALESCE(trust_score, 100) AS trust_score
         FROM tb_users
         WHERE id = $1`,
        [userId],
    );

    return result.rows[0]?.trust_score ?? 100;
};

const findActiveIncidentById = async (incidentId) => {
    const result = await db.query(
        `SELECT incident_id
         FROM tb_incidents
         WHERE incident_id = $1
           AND incident_status = 'active'`,
        [incidentId],
    );

    return result.rows[0] ?? null;
};

const createFalseIncidentReport = async ({ incidentId, userId }) => {
    const result = await db.query(
        `INSERT INTO tb_incident_false_reports (incident_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (incident_id, user_id) DO NOTHING
         RETURNING false_report_id, incident_id, user_id, created_at`,
        [incidentId, userId],
    );

    return result.rows[0] ?? null;
};

// referenceTime ทำให้การยืนยัน Type ภายหลังยังเทียบ "เวลาที่ Report ถูกส่ง" จริง ๆ
// ไม่ใช่เวลาที่ Administrator มากดตรวจในภายหลัง
const findActiveIncidentMatch = async ({ typeId, lat, lng, referenceTime = null }, queryable = db) => {
    const result = await queryable.query(
        `SELECT
            incident.incident_id,
            ROUND(ST_Distance(
                incident.incident_location::geography,
                ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
            )::numeric, 2) AS distance_m,
            ROUND((ABS(EXTRACT(EPOCH FROM (
                incident.last_reported_at - COALESCE($4::timestamp, CURRENT_TIMESTAMP)
            ))) / 60)::numeric, 2)
                AS time_difference_minutes
        FROM tb_incidents incident
        WHERE incident.incident_status = 'active'
          AND incident.final_type_id = $1
          AND ST_DWithin(
                incident.incident_location::geography,
                ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
                ${matchingConfig.distanceMeters}
          )
          AND incident.last_reported_at BETWEEN
                COALESCE($4::timestamp, CURRENT_TIMESTAMP) - INTERVAL '${matchingConfig.timeMinutes} minutes'
            AND COALESCE($4::timestamp, CURRENT_TIMESTAMP) + INTERVAL '${matchingConfig.timeMinutes} minutes'
        ORDER BY distance_m ASC, time_difference_minutes ASC, incident.incident_id ASC
        LIMIT 1`,
        [typeId, lng, lat, referenceTime],
    );

    return result.rows[0] ?? null;
};

const findNearbyActiveIncident = async ({ lat, lng }, queryable = db) => {
    const result = await queryable.query(
        `SELECT
            incident.incident_id,
            ROUND(ST_Distance(
                incident.incident_location::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
            )::numeric, 2) AS distance_m,
            ROUND((EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - incident.last_reported_at)) / 60)::numeric, 2)
                AS time_difference_minutes
        FROM tb_incidents incident
        WHERE incident.incident_status = 'active'
          AND incident.final_type_id IS NOT NULL
          AND ST_DWithin(
                incident.incident_location::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                ${matchingConfig.distanceMeters}
          )
          AND incident.last_reported_at >= CURRENT_TIMESTAMP - INTERVAL '${matchingConfig.timeMinutes} minutes'
        ORDER BY distance_m ASC, time_difference_minutes ASC, incident.incident_id ASC
        LIMIT 1`,
        [lng, lat],
    );

    return result.rows[0] ?? null;
};

const updateIncidentForAutoMerge = async (incidentId, queryable = db) => {
    const result = await queryable.query(
        `UPDATE tb_incidents
         SET report_count = report_count + 1,
             last_reported_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE incident_id = $1
           AND incident_status = 'active'
         RETURNING
            incident_id,
            final_type_id,
            title,
            description,
            ST_X(incident_location) AS lng,
            ST_Y(incident_location) AS lat,
            display_mode,
            radius_m,
            severity,
            confidence_score,
            verification_status,
            incident_status,
            report_count,
            first_reported_at,
            last_reported_at,
            created_at`,
        [incidentId],
    );

    return result.rows[0] ?? null;
};

const createReportCandidate = async ({ reportId, targetIncidentId, match }, queryable = db) => {
    const result = await queryable.query(
        `INSERT INTO tb_incident_report_candidates (
            report_id, target_incident_id, distance_m, time_difference_minutes
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            candidate_id,
            report_id,
            target_incident_id,
            distance_m,
            time_difference_minutes,
            candidate_status,
            created_at`,
        [
            reportId,
            targetIncidentId,
            match.distance_m,
            match.time_difference_minutes,
        ],
    );

    return result.rows[0];
};

const findNearbyCandidateGroup = async ({ lat, lng }, queryable = db) => {
    const result = await queryable.query(
        `SELECT
            candidate_group.candidate_group_id,
            ROUND(ST_Distance(
                anchor_report.incident_location::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
            )::numeric, 2) AS distance_m,
            ROUND((EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - anchor_report.created_at)) / 60)::numeric, 2)
                AS time_difference_minutes
         FROM tb_incident_candidate_groups candidate_group
         JOIN tb_incident_reports anchor_report ON anchor_report.report_id = candidate_group.anchor_report_id
         WHERE candidate_group.candidate_status = 'pending'
           AND anchor_report.incident_id IS NULL
           AND anchor_report.final_type_id IS NULL
           AND anchor_report.report_status = 'pending'
           AND ST_DWithin(
                anchor_report.incident_location::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                ${matchingConfig.distanceMeters}
           )
           AND anchor_report.created_at >= CURRENT_TIMESTAMP - INTERVAL '${matchingConfig.timeMinutes} minutes'
         ORDER BY distance_m ASC, time_difference_minutes ASC, candidate_group.candidate_group_id ASC
         LIMIT 1`,
        [lng, lat],
    );

    return result.rows[0] ?? null;
};

const findNearbyUngroupedUnclassifiedReport = async ({ reportId, lat, lng }, queryable = db) => {
    const result = await queryable.query(
        `SELECT
            report.report_id,
            ROUND(ST_Distance(
                report.incident_location::geography,
                ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
            )::numeric, 2) AS distance_m,
            ROUND((EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - report.created_at)) / 60)::numeric, 2)
                AS time_difference_minutes
         FROM tb_incident_reports report
         LEFT JOIN tb_incident_candidate_group_reports group_member ON group_member.report_id = report.report_id
         WHERE report.report_id <> $1
           AND report.incident_id IS NULL
           AND report.final_type_id IS NULL
           AND report.type_status = 'pending'
           AND report.report_status = 'pending'
           AND group_member.report_id IS NULL
           AND ST_DWithin(
                report.incident_location::geography,
                ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
                ${matchingConfig.distanceMeters}
           )
           AND report.created_at >= CURRENT_TIMESTAMP - INTERVAL '${matchingConfig.timeMinutes} minutes'
         ORDER BY distance_m ASC, time_difference_minutes ASC, report.report_id ASC
         LIMIT 1`,
        [reportId, lng, lat],
    );

    return result.rows[0] ?? null;
};

const createCandidateGroup = async ({ anchorReportId, reportId }, queryable = db) => {
    const groupResult = await queryable.query(
        `INSERT INTO tb_incident_candidate_groups (anchor_report_id)
         VALUES ($1)
         RETURNING candidate_group_id, anchor_report_id, candidate_status, created_at`,
        [anchorReportId],
    );
    const candidateGroup = groupResult.rows[0];

    await queryable.query(
        `INSERT INTO tb_incident_candidate_group_reports (candidate_group_id, report_id)
         VALUES ($1, $2), ($1, $3)`,
        [candidateGroup.candidate_group_id, anchorReportId, reportId],
    );

    return candidateGroup;
};

const addReportToCandidateGroup = async ({ candidateGroupId, reportId }, queryable = db) => {
    await queryable.query(
        `INSERT INTO tb_incident_candidate_group_reports (candidate_group_id, report_id)
         VALUES ($1, $2)`,
        [candidateGroupId, reportId],
    );
    return candidateGroupId;
};

const findPublicMapItems = async () => {
    const [incidentsResult, pendingReportsResult] = await Promise.all([
        db.query(
            `SELECT
                incident.incident_id,
                incident.title,
                incident.description,
                incident.final_type_id,
                incident.display_mode,
                incident.radius_m,
                incident.report_count,
                incident.verification_status,
                incident.incident_status,
                incident.last_reported_at,
                ST_Y(incident.incident_location) AS lat,
                ST_X(incident.incident_location) AS lng,
                incident_type.type_code,
                incident_type.type_name,
                incident_type.icon_name,
                incident_type.marker_color,
                latest_report.reporter_name,
                latest_report.image_url
             FROM tb_incidents incident
             LEFT JOIN tb_incident_types incident_type ON incident_type.type_id = incident.final_type_id
             LEFT JOIN LATERAL (
                SELECT
                    NULLIF(TRIM(CONCAT_WS(' ', reporter.name, reporter.lastname)), '') AS reporter_name,
                    (
                        SELECT media.media_url
                        FROM tb_incident_media media
                        WHERE media.report_id = report.report_id
                          AND media.media_type = 'image'
                        ORDER BY media.media_id ASC
                        LIMIT 1
                    ) AS image_url
                FROM tb_incident_reports report
                LEFT JOIN tb_users reporter ON reporter.id = report.user_id
                WHERE report.incident_id = incident.incident_id
                ORDER BY report.created_at DESC, report.report_id DESC
                LIMIT 1
             ) latest_report ON TRUE
             WHERE incident.incident_status = 'active'
             ORDER BY incident.last_reported_at DESC, incident.incident_id DESC`,
        ),
        db.query(
            `SELECT
                report.report_id,
                report.description,
                report.type_status,
                report.report_status,
                report.created_at,
                ST_Y(report.incident_location) AS lat,
                ST_X(report.incident_location) AS lng,
                NULLIF(TRIM(CONCAT_WS(' ', reporter.name, reporter.lastname)), '') AS reporter_name,
                first_image.image_url
             FROM tb_incident_reports report
             LEFT JOIN tb_users reporter ON reporter.id = report.user_id
             LEFT JOIN LATERAL (
                SELECT media.media_url AS image_url
                FROM tb_incident_media media
                WHERE media.report_id = report.report_id
                  AND media.media_type = 'image'
                ORDER BY media.media_id ASC
                LIMIT 1
             ) first_image ON TRUE
             WHERE report.incident_id IS NULL
               AND report.report_status = 'pending'
             ORDER BY report.created_at DESC, report.report_id DESC`,
        ),
    ]);

    return {
        incidents: incidentsResult.rows,
        pending_reports: pendingReportsResult.rows,
    };
};

const findPublicIncidentDetail = async (incidentId) => {
    const [incidentResult, reportsResult] = await Promise.all([
        db.query(
            `SELECT
                incident.incident_id,
                incident.title,
                incident.description,
                incident.display_mode,
                incident.radius_m,
                incident.verification_status,
                incident.incident_status,
                incident.report_count,
                incident.first_reported_at,
                incident.last_reported_at,
                ST_Y(incident.incident_location) AS lat,
                ST_X(incident.incident_location) AS lng,
                incident_type.type_code,
                incident_type.type_name,
                incident_type.icon_name,
                incident_type.marker_color,
                latest_report.image_url
             FROM tb_incidents incident
             LEFT JOIN tb_incident_types incident_type ON incident_type.type_id = incident.final_type_id
             LEFT JOIN LATERAL (
                SELECT media.media_url AS image_url
                FROM tb_incident_reports report
                JOIN tb_incident_media media ON media.report_id = report.report_id
                WHERE report.incident_id = incident.incident_id
                  AND media.media_type = 'image'
                ORDER BY report.created_at DESC, media.media_id ASC
                LIMIT 1
             ) latest_report ON TRUE
             WHERE incident.incident_id = $1`,
            [incidentId],
        ),
        db.query(
            `SELECT
                report.report_id,
                report.description,
                report.report_status,
                report.created_at,
                COALESCE((
                    SELECT json_agg(json_build_object(
                        'media_id', media.media_id,
                        'media_type', media.media_type,
                        'media_url', media.media_url
                    ) ORDER BY media.media_id)
                    FROM tb_incident_media media
                    WHERE media.report_id = report.report_id
                ), '[]'::json) AS media
             FROM tb_incident_reports report
             WHERE report.incident_id = $1
               AND report.report_status <> 'rejected'
             ORDER BY report.created_at DESC, report.report_id DESC`,
            [incidentId],
        ),
    ]);

    const incident = incidentResult.rows[0];
    if (!incident) return null;

    return {
        ...incident,
        reports: reportsResult.rows,
    };
};

// รายงานที่ยังไม่ถูกรวมเป็น Incident ก็ต้องเปิดดูรายละเอียดได้จากหมุดบนแผนที่
// โดยไม่เปิดเผยข้อมูลส่วนบุคคลของผู้รายงาน
const findPublicPendingReportDetail = async (reportId) => {
    const result = await db.query(
        `SELECT
            report.report_id AS incident_id,
            'รายงานรอตรวจสอบ' AS title,
            report.description,
            'marker' AS display_mode,
            NULL::numeric AS radius_m,
            'pending' AS verification_status,
            'active' AS incident_status,
            1 AS report_count,
            report.created_at AS first_reported_at,
            report.created_at AS last_reported_at,
            ST_Y(report.incident_location) AS lat,
            ST_X(report.incident_location) AS lng,
            NULL::text AS type_code,
            NULL::text AS type_name,
            NULL::text AS icon_name,
            '#e8333c' AS marker_color,
            first_image.image_url,
            json_build_array(json_build_object(
                'report_id', report.report_id,
                'description', report.description,
                'report_status', report.report_status,
                'created_at', report.created_at,
                'media', COALESCE(media_items.media, '[]'::json)
            )) AS reports
         FROM tb_incident_reports report
         LEFT JOIN LATERAL (
            SELECT media.media_url AS image_url
            FROM tb_incident_media media
            WHERE media.report_id = report.report_id
              AND media.media_type = 'image'
            ORDER BY media.media_id ASC
            LIMIT 1
         ) first_image ON TRUE
         LEFT JOIN LATERAL (
            SELECT json_agg(json_build_object(
                'media_id', media.media_id,
                'media_type', media.media_type,
                'media_url', media.media_url
            ) ORDER BY media.media_id) AS media
            FROM tb_incident_media media
            WHERE media.report_id = report.report_id
         ) media_items ON TRUE
         WHERE report.report_id = $1
           AND report.incident_id IS NULL
           AND report.report_status = 'pending'`,
        [reportId],
    );

    return result.rows[0] ?? null;
};

const reportMediaJson = `COALESCE((
    SELECT json_agg(json_build_object(
        'media_id', media.media_id,
        'media_type', media.media_type,
        'media_url', media.media_url
    ) ORDER BY media.media_id)
    FROM tb_incident_media media
    WHERE media.report_id = report.report_id
), '[]'::json)`;

const findAdminReviewQueue = async () => {
    const [reportCandidatesResult, candidateGroupsResult, pendingReportsResult] = await Promise.all([
        db.query(
            `SELECT
                candidate.candidate_id,
                candidate.distance_m,
                candidate.time_difference_minutes,
                candidate.created_at,
                report.report_id,
                report.description,
                report.user_selected_type_id,
                report.system_suggested_type_id,
                report.type_status,
                report.created_at AS report_created_at,
                ST_Y(report.incident_location) AS report_lat,
                ST_X(report.incident_location) AS report_lng,
                ${reportMediaJson} AS media,
                target.incident_id AS target_incident_id,
                target.title AS target_title,
                target.final_type_id AS target_type_id,
                target_type.type_name AS target_type_name
             FROM tb_incident_report_candidates candidate
             JOIN tb_incident_reports report ON report.report_id = candidate.report_id
             JOIN tb_incidents target ON target.incident_id = candidate.target_incident_id
             LEFT JOIN tb_incident_types target_type ON target_type.type_id = target.final_type_id
             WHERE candidate.candidate_status = 'pending'
             ORDER BY candidate.created_at DESC, candidate.candidate_id DESC`,
        ),
        db.query(
            `SELECT
                candidate_group.candidate_group_id,
                candidate_group.anchor_report_id,
                candidate_group.created_at,
                json_agg(json_build_object(
                    'report_id', report.report_id,
                    'description', report.description,
                    'system_suggested_type_id', report.system_suggested_type_id,
                    'user_selected_type_id', report.user_selected_type_id,
                    'type_status', report.type_status,
                    'created_at', report.created_at,
                    'lat', ST_Y(report.incident_location),
                    'lng', ST_X(report.incident_location),
                    'media', ${reportMediaJson}
                ) ORDER BY report.created_at, report.report_id) AS reports
             FROM tb_incident_candidate_groups candidate_group
             JOIN tb_incident_candidate_group_reports member
               ON member.candidate_group_id = candidate_group.candidate_group_id
             JOIN tb_incident_reports report ON report.report_id = member.report_id
             WHERE candidate_group.candidate_status = 'pending'
             GROUP BY candidate_group.candidate_group_id, candidate_group.anchor_report_id, candidate_group.created_at
             ORDER BY candidate_group.created_at DESC, candidate_group.candidate_group_id DESC`,
        ),
        db.query(
            `SELECT
                report.report_id,
                report.description,
                report.user_selected_type_id,
                report.system_suggested_type_id,
                report.type_status,
                report.created_at,
                ST_Y(report.incident_location) AS lat,
                ST_X(report.incident_location) AS lng,
                ${reportMediaJson} AS media
             FROM tb_incident_reports report
             LEFT JOIN tb_incident_report_candidates candidate ON candidate.report_id = report.report_id
             LEFT JOIN tb_incident_candidate_group_reports member ON member.report_id = report.report_id
             WHERE report.incident_id IS NULL
               AND report.report_status = 'pending'
               AND candidate.report_id IS NULL
               AND member.report_id IS NULL
             ORDER BY report.created_at DESC, report.report_id DESC`,
        ),
    ]);

    return {
        report_candidates: reportCandidatesResult.rows,
        candidate_groups: candidateGroupsResult.rows,
        pending_reports: pendingReportsResult.rows,
    };
};

const acceptOrRejectReportCandidate = async ({ candidateId, adminId, action }) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const candidateResult = await client.query(
            `SELECT
                candidate.candidate_id,
                candidate.report_id,
                candidate.target_incident_id,
                candidate.candidate_status,
                target.final_type_id,
                target.incident_status
             FROM tb_incident_report_candidates candidate
             JOIN tb_incidents target ON target.incident_id = candidate.target_incident_id
             WHERE candidate.candidate_id = $1
             FOR UPDATE OF candidate, target`,
            [candidateId],
        );
        const candidate = candidateResult.rows[0];
        if (!candidate || candidate.candidate_status !== 'pending') {
            throw new Error('ไม่พบ Candidate ที่รอตรวจสอบ');
        }

        if (action === 'accepted') {
            if (candidate.incident_status !== 'active' || !candidate.final_type_id) {
                throw new Error('Incident เป้าหมายไม่พร้อมให้รวม Report');
            }
            await client.query(
                `UPDATE tb_incident_reports
                 SET incident_id = $1,
                     final_type_id = $2,
                     type_status = 'confirmed',
                     report_status = 'verified',
                     updated_at = CURRENT_TIMESTAMP
                 WHERE report_id = $3`,
                [candidate.target_incident_id, candidate.final_type_id, candidate.report_id],
            );
            await updateIncidentForAutoMerge(candidate.target_incident_id, client);
        }

        await client.query(
            `UPDATE tb_incident_report_candidates
             SET candidate_status = $1,
                 decided_by = $2,
                 decided_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE candidate_id = $3`,
            [action, adminId, candidateId],
        );
        await client.query('COMMIT');
        return { candidate_id: candidateId, report_id: candidate.report_id, action };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const acceptOrRejectCandidateGroup = async ({ candidateGroupId, adminId, action, selectedType, targetIncidentId = null }) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const groupResult = await client.query(
            `SELECT candidate_group_id, candidate_status
             FROM tb_incident_candidate_groups
             WHERE candidate_group_id = $1
             FOR UPDATE`,
            [candidateGroupId],
        );
        const candidateGroup = groupResult.rows[0];
        if (!candidateGroup || candidateGroup.candidate_status !== 'pending') {
            throw new Error('ไม่พบ Candidate Group ที่รอตรวจสอบ');
        }

        let incident = null;
        if (action === 'accepted') {
            const reportsResult = await client.query(
                `SELECT
                    report.report_id,
                    report.description,
                    report.created_at,
                    ST_Y(report.incident_location) AS lat,
                    ST_X(report.incident_location) AS lng
                 FROM tb_incident_candidate_group_reports member
                 JOIN tb_incident_reports report ON report.report_id = member.report_id
                 WHERE member.candidate_group_id = $1
                 ORDER BY report.created_at, report.report_id
                 FOR UPDATE OF report`,
                [candidateGroupId],
            );
            const reports = reportsResult.rows;
            if (!reports.length) throw new Error('Candidate Group ไม่มี Report ให้ยืนยัน');

            if (targetIncidentId) {
                const targetResult = await client.query(
                    `SELECT incident_id, final_type_id, incident_status
                     FROM tb_incidents
                     WHERE incident_id = $1
                     FOR UPDATE`,
                    [targetIncidentId],
                );
                incident = targetResult.rows[0] ?? null;
                if (!incident || incident.incident_status !== 'active' || incident.final_type_id !== selectedType.type_id) {
                    throw new Error('Incident เป้าหมายต้อง active และมี Type ที่ Administrator เลือก');
                }
            } else {
                const anchor = reports[0];
                const matchingIncident = await findActiveIncidentMatch({
                    typeId: selectedType.type_id,
                    lat: anchor.lat,
                    lng: anchor.lng,
                    referenceTime: anchor.created_at,
                }, client);

                if (matchingIncident) {
                    const matchingResult = await client.query(
                        `SELECT incident_id, final_type_id, incident_status
                         FROM tb_incidents
                         WHERE incident_id = $1
                           AND incident_status = 'active'
                         FOR UPDATE`,
                        [matchingIncident.incident_id],
                    );
                    incident = matchingResult.rows[0] ?? null;
                    if (!incident || incident.final_type_id !== selectedType.type_id) {
                        throw new Error('Incident ที่ตรงเงื่อนไขไม่พร้อมให้รวม Candidate Group');
                    }
                } else {
                    incident = await createInitialIncident({
                        final_type_id: selectedType.type_id,
                        title: `${selectedType.type_name} — รอตรวจสอบ`,
                        description: anchor.description,
                        lat: anchor.lat,
                        lng: anchor.lng,
                        display_mode: selectedType.display_mode,
                        radius_m: selectedType.display_mode === 'marker' ? null : selectedType.default_radius_m,
                        report_count: 0,
                    }, client);
                }
            }

            const reportIds = reports.map((report) => report.report_id);
            await client.query(
                `UPDATE tb_incident_reports
                 SET incident_id = $1,
                     final_type_id = $2,
                     type_status = 'confirmed',
                     report_status = 'verified',
                     updated_at = CURRENT_TIMESTAMP
                 WHERE report_id = ANY($3::int[])`,
                [incident.incident_id, selectedType.type_id, reportIds],
            );
            await client.query(
                `UPDATE tb_incidents
                 SET report_count = report_count + $2,
                     last_reported_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE incident_id = $1`,
                [incident.incident_id, reportIds.length],
            );
        }

        await client.query(
            `UPDATE tb_incident_candidate_groups
             SET candidate_status = $1,
                 decided_by = $2,
                 decided_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE candidate_group_id = $3`,
            [action, adminId, candidateGroupId],
        );
        await client.query('COMMIT');
        return { candidate_group_id: candidateGroupId, incident, action };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const createIncidentFromPendingReport = async ({ reportId, adminId, selectedType }) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const reportResult = await client.query(
            `SELECT
                report_id,
                description,
                report_status,
                incident_id,
                created_at,
                ST_Y(incident_location) AS lat,
                ST_X(incident_location) AS lng
             FROM tb_incident_reports
             WHERE report_id = $1
             FOR UPDATE`,
            [reportId],
        );
        const report = reportResult.rows[0];
        if (!report || report.report_status !== 'pending' || report.incident_id) {
            throw new Error('Report นี้ไม่พร้อมให้ยืนยัน Type');
        }

        // หลัง Administrator ยืนยัน Type ให้ Report เดิมกลับมาใช้กติกาเดียวกับ Report
        // ที่ผู้ใช้ยืนยัน Type ตั้งแต่แรก โดยใช้เวลาที่ Report ถูกส่งจริง
        const matchingIncident = await findActiveIncidentMatch({
            typeId: selectedType.type_id,
            lat: report.lat,
            lng: report.lng,
            referenceTime: report.created_at,
        }, client);
        const incident = matchingIncident
            ? await updateIncidentForAutoMerge(matchingIncident.incident_id, client)
            : await createInitialIncident({
                final_type_id: selectedType.type_id,
                title: `${selectedType.type_name} — รอตรวจสอบ`,
                description: report.description,
                lat: report.lat,
                lng: report.lng,
                display_mode: selectedType.display_mode,
                radius_m: selectedType.display_mode === 'marker' ? null : selectedType.default_radius_m,
            }, client);

        if (!incident) throw new Error('Incident ที่ตรงเงื่อนไขไม่พร้อมให้รวม Report');
        await client.query(
            `UPDATE tb_incident_reports
             SET incident_id = $1,
                 final_type_id = $2,
                 type_status = 'confirmed',
                 report_status = 'verified',
                 updated_at = CURRENT_TIMESTAMP
             WHERE report_id = $3`,
            [incident.incident_id, selectedType.type_id, reportId],
        );
        await client.query('COMMIT');
        return {
            incident,
            report_id: reportId,
            merge_status: matchingIncident ? 'auto_merged' : 'created',
            reviewed_by: adminId,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// ใช้กับ Report เดี่ยวในคิวเท่านั้น; Candidate มีการตัดสินของตัวเองเพื่อไม่ให้สับสนว่า
// “ปฏิเสธความสัมพันธ์” กับ “ปฏิเสธ Report” คือสิ่งเดียวกัน
const rejectStandalonePendingReport = async ({ reportId, adminId }) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const reportResult = await client.query(
            `SELECT report.report_id
             FROM tb_incident_reports report
             WHERE report.report_id = $1
               AND report.incident_id IS NULL
               AND report.report_status = 'pending'
               AND NOT EXISTS (
                   SELECT 1
                   FROM tb_incident_report_candidates candidate
                   WHERE candidate.report_id = report.report_id
                     AND candidate.candidate_status = 'pending'
               )
               AND NOT EXISTS (
                   SELECT 1
                   FROM tb_incident_candidate_group_reports member
                   JOIN tb_incident_candidate_groups candidate_group
                     ON candidate_group.candidate_group_id = member.candidate_group_id
                    AND candidate_group.candidate_status = 'pending'
                   WHERE member.report_id = report.report_id
               )
             FOR UPDATE`,
            [reportId],
        );
        if (!reportResult.rows[0]) {
            throw new Error('Report นี้ไม่ใช่รายการเดี่ยวที่รอตรวจสอบ');
        }

        await client.query(
            `UPDATE tb_incident_reports
             SET report_status = 'rejected',
                 updated_at = CURRENT_TIMESTAMP
             WHERE report_id = $1`,
            [reportId],
        );
        await client.query('COMMIT');
        return { report_id: reportId, report_status: 'rejected', reviewed_by: adminId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const separateReportFromIncident = async ({ reportId, adminId, selectedType }) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const reportResult = await client.query(
            `SELECT
                report.report_id,
                report.description,
                report.incident_id,
                ST_Y(report.incident_location) AS lat,
                ST_X(report.incident_location) AS lng,
                source_incident.report_count
             FROM tb_incident_reports report
             JOIN tb_incidents source_incident ON source_incident.incident_id = report.incident_id
             WHERE report.report_id = $1
             FOR UPDATE OF report, source_incident`,
            [reportId],
        );
        const report = reportResult.rows[0];
        if (!report || report.report_count <= 1) {
            throw new Error('แยก Report ไม่ได้ เพราะ Incident เดิมต้องมี Report เหลืออย่างน้อยหนึ่งรายการ');
        }

        const incident = await createInitialIncident({
            final_type_id: selectedType.type_id,
            title: `${selectedType.type_name} — รอตรวจสอบ`,
            description: report.description,
            lat: report.lat,
            lng: report.lng,
            display_mode: selectedType.display_mode,
            radius_m: selectedType.display_mode === 'marker' ? null : selectedType.default_radius_m,
        }, client);
        await client.query(
            `UPDATE tb_incident_reports
             SET incident_id = $1,
                 final_type_id = $2,
                 type_status = 'confirmed',
                 report_status = 'verified',
                 updated_at = CURRENT_TIMESTAMP
             WHERE report_id = $3`,
            [incident.incident_id, selectedType.type_id, reportId],
        );
        await client.query(
            `UPDATE tb_incidents
             SET report_count = report_count - 1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE incident_id = $1`,
            [report.incident_id],
        );
        await client.query('COMMIT');
        return { incident, report_id: reportId, reviewed_by: adminId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const saveIncidentMedia = async ({ reportId, media }, queryable = db) => {
    const savedMedia = [];

    for (const file of media) {
        const result = await queryable.query(
            `INSERT INTO tb_incident_media (report_id, media_type, media_url)
             VALUES ($1, $2, $3)
             RETURNING media_id, report_id, media_type, media_url, created_at`,
            [reportId, file.media_type, file.media_url],
        );
        savedMedia.push(result.rows[0]);
    }

    return savedMedia;
};

// Incident, Report, Candidate และ metadata ของไฟล์แนบต้องสำเร็จพร้อมกัน หรือไม่บันทึกทั้งชุด
const createIncidentReportWithMerge = async ({ incidentData, reportData, media = [] }) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        const reporterTrustScore = await getReporterTrustScore(reportData.user_id, client);
        const typeStatus = reportData.type_status ?? (reportData.final_type_id ? 'confirmed' : 'pending');
        const canAutoMerge = typeStatus === 'confirmed' && reportData.final_type_id;
        const matchingIncident = canAutoMerge
            ? await findActiveIncidentMatch({
                typeId: reportData.final_type_id,
                lat: reportData.lat,
                lng: reportData.lng,
            }, client)
            : null;

        let incident = null;
        let resultStatus = 'pending';
        let reportCandidate = null;
        let candidateGroup = null;

        if (canAutoMerge && matchingIncident) {
            incident = await updateIncidentForAutoMerge(matchingIncident.incident_id, client);
            if (!incident) {
                throw new Error('ไม่สามารถรวมรายงานเข้ากับ Incident ที่เลือกได้');
            }
            resultStatus = 'auto_merged';
        } else if (canAutoMerge) {
            incident = await createInitialIncident(incidentData, client);
            resultStatus = 'created';
        }

        const report = await createIncidentReport({
            ...reportData,
            incident_id: incident?.incident_id ?? null,
            reporter_trust_score: reporterTrustScore,
            type_status: typeStatus,
            report_status: 'pending',
        }, client);

        // ไม่เลือก Type: หา Incident ใกล้ที่สุดก่อน ถ้าไม่มีจึงรวมเป็น Candidate Group กับ Report ที่ยังไม่จัดประเภท
        if (!canAutoMerge && typeStatus === 'pending') {
            const nearbyIncident = await findNearbyActiveIncident({ lat: reportData.lat, lng: reportData.lng }, client);
            if (nearbyIncident) {
                reportCandidate = await createReportCandidate({
                    reportId: report.report_id,
                    targetIncidentId: nearbyIncident.incident_id,
                    match: nearbyIncident,
                }, client);
                resultStatus = 'candidate';
            } else {
                const nearbyGroup = await findNearbyCandidateGroup({ lat: reportData.lat, lng: reportData.lng }, client);
                if (nearbyGroup) {
                    await addReportToCandidateGroup({
                        candidateGroupId: nearbyGroup.candidate_group_id,
                        reportId: report.report_id,
                    }, client);
                    candidateGroup = nearbyGroup;
                    resultStatus = 'candidate_group';
                } else {
                    const nearbyReport = await findNearbyUngroupedUnclassifiedReport({
                        reportId: report.report_id,
                        lat: reportData.lat,
                        lng: reportData.lng,
                    }, client);
                    if (nearbyReport) {
                        candidateGroup = await createCandidateGroup({
                            anchorReportId: nearbyReport.report_id,
                            reportId: report.report_id,
                        }, client);
                        resultStatus = 'candidate_group';
                    }
                }
            }
        }

        const savedMedia = await saveIncidentMedia({
            reportId: report.report_id,
            media,
        }, client);

        await client.query('COMMIT');
        return {
            ...report,
            incident,
            media: savedMedia,
            merge_status: resultStatus,
            candidate: reportCandidate,
            candidate_group: candidateGroup,
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
            incident_type.is_quick,
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

const findActiveIncidentTypeById = async (typeId) => {
    const result = await db.query(
        `SELECT
            incident_type.type_id,
            incident_type.type_name,
            incident_type.display_mode,
            incident_type.default_radius_m
         FROM tb_incident_types incident_type
         JOIN tb_incident_categories category ON category.category_id = incident_type.category_id
         WHERE incident_type.type_id = $1
           AND incident_type.is_active = TRUE
           AND category.is_active = TRUE`,
        [typeId],
    );

    return result.rows[0] ?? null;
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
            incident_type.is_quick,
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

// Cache สำหรับหน้า Report: Database ยังคงเป็นแหล่งข้อมูลจริง แต่ frontend ใช้ข้อมูลชุดนี้
// จับ keyword ในหน่วยความจำระหว่างผู้ใช้กำลังพิมพ์ได้โดยไม่ต้อง query ซ้ำ
const findActiveIncidentKeywordRows = async () => {
    const result = await db.query(
        `SELECT
            keyword.keyword,
            incident_type.type_id,
            incident_type.type_code,
            incident_type.type_name,
            incident_type.icon_name,
            incident_type.marker_color,
            incident_type.is_quick,
            incident_type.display_mode,
            incident_type.default_radius_m
         FROM tb_incident_keywords keyword
         JOIN tb_incident_types incident_type ON incident_type.type_id = keyword.type_id
         JOIN tb_incident_categories category ON category.category_id = incident_type.category_id
         WHERE keyword.is_active = TRUE
           AND incident_type.is_active = TRUE
           AND category.is_active = TRUE
         -- เรียงเหมือน findSuggestedTypes เพื่อให้ Warning ฝั่งหน้าและการตรวจ Conflict ฝั่ง server เห็น Type แรกตรงกัน
         ORDER BY CHAR_LENGTH(keyword.keyword) DESC, incident_type.sort_order, incident_type.type_id, keyword.keyword`,
    );

    return result.rows;
};

module.exports = {
    createIncidentReport,
    createIncident: createIncidentReport,
    createIncidentReportWithMerge,
    findActiveIncidentById,
    createFalseIncidentReport,
    findSuggestedTypes,
    findActiveIncidentTypeIds,
    findActiveIncidentTypeById,
    findActiveIncidentCatalogRows,
    findActiveIncidentKeywordRows,
    findPublicMapItems,
    findPublicIncidentDetail,
    findPublicPendingReportDetail,
    findAdminReviewQueue,
    acceptOrRejectReportCandidate,
    acceptOrRejectCandidateGroup,
    createIncidentFromPendingReport,
    rejectStandalonePendingReport,
    separateReportFromIncident,
};
