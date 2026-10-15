const db = require('../../db/db');
const createHelpRequest = async (data, client = db) => {
    const {
        user_id,
        help_type,
        custom_help_type,
        description,
        people_count,
        lat,
        lng,
        location_source,
    } = data
    const result = await client.query(
        `INSERT INTO tb_help_requests (
            user_id,
            help_type,
            custom_help_type,
            description,
            people_count,
            help_location,
            location_source
        )
        VALUES (
             $1, $2, $3, $4, $5, 
            ST_SetSRID(ST_MakePoint($7, $6), 4326),
             $8
        )
        RETURNING
            help_request_id,
            user_id,
            request_status,
            expires_at,
            created_at`,
        [
            user_id,
            help_type,
            custom_help_type,
            description,
            people_count,
            lat,
            lng,
            location_source
        ],
    );
    return result.rows[0]
}

const createHelpRequestUpdate = async (data, client = db) => {
    const {
        help_request_id,
        user_id,
        message,
        status_after
    } = data
    const result = await client.query(
        `INSERT INTO  tb_help_request_updates (
            help_request_id,
            user_id,
            message,
            status_after
    )
        VALUES ($1, $2, $3, $4)
        RETURNING
            help_request_update_id,
            help_request_id,
            user_id,
            message,
            status_after,
            created_at `,
        [
            help_request_id,
            user_id,
            message,
            status_after
        ],
    );
    return result.rows[0]
}

const getActiveHelpRequests = async () => {
    const result = await db.query(
        `SELECT  
            help_request_id,
            help_type,
            custom_help_type,
            description,
            people_count,
            ST_Y(help_location) AS lat,
            ST_X(help_location) AS lng,
            expires_at,
            created_at
        FROM tb_help_requests
        WHERE request_status = 'pending'
        AND expires_at > NOW()
        ORDER BY created_at DESC `
    );
    return result.rows
}

const getPublicHelpRequestDetail = async (helpRequestId) => {
    const result = await db.query(
        `SELECT
            help_request_id,
            COALESCE(NULLIF(custom_help_type, ''), help_type, 'คำขอความช่วยเหลือ') AS title,
            COALESCE(NULLIF(custom_help_type, ''), help_type, 'คำขอความช่วยเหลือ') AS type_name,
            description,
            people_count,
            request_status,
            expires_at,
            created_at,
            ST_Y(help_location) AS lat,
            ST_X(help_location) AS lng
         FROM tb_help_requests
         WHERE help_request_id = $1
           AND request_status = 'pending'
           AND expires_at > NOW()`,
        [helpRequestId],
    );
    return result.rows[0] ?? null;
}

module.exports = {
    createHelpRequest,
    createHelpRequestUpdate,
    getActiveHelpRequests,
    getPublicHelpRequestDetail,
};
