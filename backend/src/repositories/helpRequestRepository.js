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

// จำนวนข้อเสนอที่ยังมีผล (รอตอบ + รับแล้ว) ของคำขอหนึ่งรายการ ใช้ซ้ำในหลาย query
const activeOfferCountSql = `(
    SELECT COUNT(*)::int
    FROM tb_help_offers offer
    WHERE offer.help_request_id = request.help_request_id
      AND offer.offer_status IN ('pending', 'accepted')
)`;

// ปัดพิกัดลงตารางขนาด 0.005 องศา (ราว 500 เมตร) ให้คนทั่วไปเห็นแค่ตำแหน่งคร่าวๆ
// พิกัดจริงส่งให้เฉพาะเจ้าของคำขอและผู้ช่วยที่ได้รับเลือก (service เป็นคนเลือก)
const APPROX_GRID_SIZE = 0.005;
const approxLatSql = `ROUND(ST_Y(ST_SnapToGrid(request.help_location, ${APPROX_GRID_SIZE}))::numeric, 4)::float`;
const approxLngSql = `ROUND(ST_X(ST_SnapToGrid(request.help_location, ${APPROX_GRID_SIZE}))::numeric, 4)::float`;

// คำขอที่ยังแสดงบนแผนที่: รอความช่วยเหลือ และมีผู้ช่วยแล้ว (ยังไม่หมดอายุ)
const getActiveHelpRequests = async () => {
    const result = await db.query(
        `SELECT
            request.help_request_id,
            request.help_type,
            request.custom_help_type,
            request.description,
            request.people_count,
            request.request_status,
            ${approxLatSql} AS lat,
            ${approxLngSql} AS lng,
            request.expires_at,
            request.created_at,
            ${activeOfferCountSql} AS offer_count
        FROM tb_help_requests request
        WHERE request.request_status IN ('pending', 'accepted')
        AND request.expires_at > NOW()
        ORDER BY request.created_at DESC `
    );
    return result.rows
}

// คำขอทั้งหมดที่ผู้ใช้คนนี้ส่ง (ทุกสถานะ) สำหรับการ์ดในหน้าโปรไฟล์
const getHelpRequestsByOwner = async (userId) => {
    const result = await db.query(
        `SELECT
            request.help_request_id,
            request.help_type,
            request.custom_help_type,
            request.people_count,
            request.request_status,
            request.expires_at,
            (request.expires_at <= NOW()) AS is_expired,
            request.created_at,
            ${activeOfferCountSql} AS offer_count
        FROM tb_help_requests request
        WHERE request.user_id = $1
        ORDER BY request.created_at DESC
        LIMIT 50`,
        [userId],
    );
    return result.rows;
};

// คำขอที่ผู้ใช้คนนี้เคยเสนอช่วย พร้อมสถานะข้อเสนอของตัวเอง
const getOffersByHelper = async (helperId) => {
    const result = await db.query(
        `SELECT
            request.help_request_id,
            request.help_type,
            request.custom_help_type,
            request.people_count,
            request.request_status,
            request.expires_at,
            (request.expires_at <= NOW()) AS is_expired,
            request.created_at,
            offer.offer_id,
            offer.offer_status,
            offer.created_at AS offered_at
        FROM tb_help_offers offer
        JOIN tb_help_requests request ON request.help_request_id = offer.help_request_id
        WHERE offer.helper_id = $1
        ORDER BY offer.created_at DESC
        LIMIT 50`,
        [helperId],
    );
    return result.rows;
};

// ---- รูปของคำขอ ----

const createHelpRequestMedia = async ({ helpRequestId, mediaType, mediaUrl }, client = db) => {
    const result = await client.query(
        `INSERT INTO tb_help_request_media (help_request_id, media_type, media_url)
         VALUES ($1, $2, $3)
         RETURNING media_id, media_type, media_url, created_at`,
        [helpRequestId, mediaType, mediaUrl],
    );
    return result.rows[0];
};

const getHelpRequestMedia = async (helpRequestId) => {
    const result = await db.query(
        `SELECT media_id, media_type, media_url, created_at
         FROM tb_help_request_media
         WHERE help_request_id = $1
         ORDER BY media_id ASC`,
        [helpRequestId],
    );
    return result.rows;
};

// ---- รายละเอียดคำขอ ----

// ข้อมูลเต็มของคำขอ 1 รายการ รวมชื่อและเบอร์ของผู้ขอ
// เบอร์ (requester_phone) ใช้ภายใน service เท่านั้น service จะเลือกเองว่าส่งให้ใครเห็น
const getHelpRequestById = async (helpRequestId, client = db) => {
    const result = await client.query(
        `SELECT
            request.help_request_id,
            request.user_id,
            request.help_type,
            request.custom_help_type,
            request.description,
            request.people_count,
            ST_Y(request.help_location) AS lat,
            ST_X(request.help_location) AS lng,
            ${approxLatSql} AS approx_lat,
            ${approxLngSql} AS approx_lng,
            request.request_status,
            request.accepted_by,
            request.accepted_at,
            request.resolved_at,
            request.cancelled_at,
            request.share_phone,
            request.share_line,
            request.expires_at,
            (request.expires_at <= NOW()) AS is_expired,
            request.created_at,
            NULLIF(TRIM(CONCAT_WS(' ', requester.name, requester.lastname)), '') AS requester_name,
            NULLIF(TRIM(requester.phone), '') AS requester_phone,
            NULLIF(TRIM(requester.line_id), '') AS requester_line_id,
            ${activeOfferCountSql} AS offer_count
        FROM tb_help_requests request
        LEFT JOIN tb_users requester ON requester.id = request.user_id
        WHERE request.help_request_id = $1`,
        [helpRequestId],
    );
    return result.rows[0];
};

// ล็อกแถวคำขอไว้ระหว่าง transaction กันสองคนกดรับข้อเสนอพร้อมกัน
const lockHelpRequest = async (helpRequestId, client) => {
    const result = await client.query(
        `SELECT help_request_id, user_id, request_status, expires_at, (expires_at <= NOW()) AS is_expired
         FROM tb_help_requests
         WHERE help_request_id = $1
         FOR UPDATE`,
        [helpRequestId],
    );
    return result.rows[0];
};

// รับข้อเสนอแล้ว: บันทึกผู้ช่วย + ช่องทางที่ผู้ขอเลือกแชร์
// ต่ออายุคำขออย่างน้อย 24 ชม. จากตอนนี้ ผู้ช่วยจะได้มีเวลาเดินทาง
const markHelpRequestAccepted = async ({ helpRequestId, helperId, sharePhone, shareLine }, client) => {
    const result = await client.query(
        `UPDATE tb_help_requests
         SET request_status = 'accepted',
             accepted_by = $2,
             accepted_at = CURRENT_TIMESTAMP,
             share_phone = $3,
             share_line = $4,
             expires_at = GREATEST(expires_at, CURRENT_TIMESTAMP + INTERVAL '24 hours'),
             updated_at = CURRENT_TIMESTAMP
         WHERE help_request_id = $1
         RETURNING help_request_id, request_status, accepted_by, accepted_at`,
        [helpRequestId, helperId, sharePhone, shareLine],
    );
    return result.rows[0];
};

// ผู้ช่วยถอนตัว / ผู้ขอปลดผู้ช่วย: กลับไปรอความช่วยเหลือใหม่ และต่ออายุอีก 24 ชม.
const reopenHelpRequest = async (helpRequestId, client) => {
    await client.query(
        `UPDATE tb_help_requests
         SET request_status = 'pending',
             accepted_by = NULL,
             accepted_at = NULL,
             share_phone = FALSE,
             share_line = FALSE,
             expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours',
             updated_at = CURRENT_TIMESTAMP
         WHERE help_request_id = $1`,
        [helpRequestId],
    );
};

const markHelpRequestResolved = async (helpRequestId, client) => {
    await client.query(
        `UPDATE tb_help_requests
         SET request_status = 'resolved',
             resolved_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE help_request_id = $1`,
        [helpRequestId],
    );
};

const markHelpRequestCancelled = async (helpRequestId, client) => {
    await client.query(
        `UPDATE tb_help_requests
         SET request_status = 'cancelled',
             cancelled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE help_request_id = $1`,
        [helpRequestId],
    );
};

// ---- ข้อเสนอช่วยเหลือ ----

// รายการข้อเสนอของคำขอ พร้อมข้อมูลผู้ช่วยให้เจ้าของคำขอใช้ตัดสินใจ
// - helper_since: สมัครสมาชิกเมื่อไหร่
// - helped_count: เคยช่วยสำเร็จกี่ครั้ง (คำขอที่ปิดว่า resolved โดยมีคนนี้เป็นผู้ช่วย)
// - helper_phone / helper_line_id: service จะส่งให้เจ้าของเห็นเฉพาะข้อเสนอที่รับแล้ว
const getOffersForRequest = async (helpRequestId) => {
    const result = await db.query(
        `SELECT
            offer.offer_id,
            offer.helper_id,
            NULLIF(TRIM(CONCAT_WS(' ', helper.name, helper.lastname)), '') AS helper_name,
            helper.created_at AS helper_since,
            (
                SELECT COUNT(*)::int
                FROM tb_help_requests helped
                WHERE helped.accepted_by = offer.helper_id
                  AND helped.request_status = 'resolved'
            ) AS helped_count,
            NULLIF(TRIM(helper.phone), '') AS helper_phone,
            NULLIF(TRIM(helper.line_id), '') AS helper_line_id,
            offer.message,
            offer.offer_status,
            offer.created_at
         FROM tb_help_offers offer
         LEFT JOIN tb_users helper ON helper.id = offer.helper_id
         WHERE offer.help_request_id = $1
         ORDER BY offer.created_at ASC`,
        [helpRequestId],
    );
    return result.rows;
};

// ข้อเสนอที่ถูกรับอยู่ตอนนี้ของคำขอ (มีได้แค่ 1 รายการ)
const findAcceptedOffer = async (helpRequestId, client = db) => {
    const result = await client.query(
        `SELECT offer_id, helper_id, offer_status
         FROM tb_help_offers
         WHERE help_request_id = $1 AND offer_status = 'accepted'
         LIMIT 1`,
        [helpRequestId],
    );
    return result.rows[0];
};

// ผู้ใช้คนนี้มีเบอร์ / LINE ในโปรไฟล์ไหม (ไม่ส่งค่าจริงออกไป บอกแค่มีหรือไม่มี)
const getUserContactFlags = async (userId, client = db) => {
    const result = await client.query(
        `SELECT
            (NULLIF(TRIM(phone), '') IS NOT NULL) AS has_phone,
            (NULLIF(TRIM(line_id), '') IS NOT NULL) AS has_line
         FROM tb_users
         WHERE id = $1`,
        [userId],
    );
    return result.rows[0] ?? { has_phone: false, has_line: false };
};

// ---- รายงานผู้ใช้ ----

const createUserReport = async ({ reporterId, reportedUserId, helpRequestId, reason, details }) => {
    const result = await db.query(
        `INSERT INTO tb_user_reports (reporter_id, reported_user_id, help_request_id, reason, details)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING report_id, reason, report_status, created_at`,
        [reporterId, reportedUserId, helpRequestId, reason, details],
    );
    return result.rows[0];
};

// ผู้ใช้ที่คนดูเคยรายงานไปแล้วในคำขอนี้ (หน้าเว็บจะได้ซ่อนปุ่มรายงานซ้ำ)
const getReportedUserIds = async ({ reporterId, helpRequestId }) => {
    const result = await db.query(
        `SELECT reported_user_id
         FROM tb_user_reports
         WHERE reporter_id = $1 AND help_request_id = $2`,
        [reporterId, helpRequestId],
    );
    return result.rows.map((row) => row.reported_user_id);
};

const findOfferByHelper = async ({ helpRequestId, helperId }, client = db) => {
    const result = await client.query(
        `SELECT offer_id, offer_status, message, created_at
         FROM tb_help_offers
         WHERE help_request_id = $1 AND helper_id = $2`,
        [helpRequestId, helperId],
    );
    return result.rows[0];
};

const findOfferById = async ({ helpRequestId, offerId }, client = db) => {
    const result = await client.query(
        `SELECT offer_id, help_request_id, helper_id, offer_status
         FROM tb_help_offers
         WHERE offer_id = $1 AND help_request_id = $2`,
        [offerId, helpRequestId],
    );
    return result.rows[0];
};

const createOffer = async ({ helpRequestId, helperId, message }, client = db) => {
    const result = await client.query(
        `INSERT INTO tb_help_offers (help_request_id, helper_id, message)
         VALUES ($1, $2, $3)
         RETURNING offer_id, help_request_id, helper_id, message, offer_status, created_at`,
        [helpRequestId, helperId, message],
    );
    return result.rows[0];
};

const updateOfferStatus = async ({ offerId, offerStatus }, client) => {
    const result = await client.query(
        `UPDATE tb_help_offers
         SET offer_status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE offer_id = $1
         RETURNING offer_id, offer_status`,
        [offerId, offerStatus],
    );
    return result.rows[0];
};

// รับข้อเสนอหนึ่งแล้ว (หรือยกเลิกคำขอ) ข้อเสนออื่นที่ยังรออยู่ถือว่าไม่ได้รับเลือก
// ยกเลิกคำขอ: ส่ง acceptedOfferId = 0 เพื่อปฏิเสธทุกข้อเสนอที่ยังรอ
const declineOtherPendingOffers = async ({ helpRequestId, acceptedOfferId }, client) => {
    await client.query(
        `UPDATE tb_help_offers
         SET offer_status = 'declined', updated_at = CURRENT_TIMESTAMP
         WHERE help_request_id = $1 AND offer_id <> $2 AND offer_status = 'pending'`,
        [helpRequestId, acceptedOfferId],
    );
};

module.exports = {
    createHelpRequest,
    createHelpRequestUpdate,
    getActiveHelpRequests,
    getHelpRequestsByOwner,
    getOffersByHelper,
    createHelpRequestMedia,
    getHelpRequestMedia,
    getHelpRequestById,
    lockHelpRequest,
    markHelpRequestAccepted,
    reopenHelpRequest,
    markHelpRequestResolved,
    markHelpRequestCancelled,
    getOffersForRequest,
    findAcceptedOffer,
    findOfferByHelper,
    findOfferById,
    createOffer,
    updateOfferStatus,
    declineOtherPendingOffers,
    getUserContactFlags,
    createUserReport,
    getReportedUserIds,
};
