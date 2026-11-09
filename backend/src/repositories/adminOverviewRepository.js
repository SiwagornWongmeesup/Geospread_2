// repositories/adminOverviewRepository.js
// -------------------------------------------------------------------------
// ดึงข้อมูลสรุปสำหรับแดชบอร์ดผู้ดูแลระบบ (/admin) จากตารางจริง
// แต่ละฟังก์ชันทำ 1 query และคืนเฉพาะข้อมูล (rows) ให้ Service จัดรูปต่อ
// -------------------------------------------------------------------------
const db = require('../../db/db');

// ตัวเลขหลัก: รายงานรอตรวจ (และเวลาของรายงานที่รอนานที่สุด), เหตุการณ์ที่ยังดำเนินอยู่,
// คำขอความช่วยเหลือที่ยังเปิดอยู่, ผู้ใช้ทั้งหมด และผู้ใช้ใหม่ใน 7 วัน
const getSummary = async () => {
    const result = await db.query(
        `SELECT
            (SELECT COUNT(*) FROM tb_incident_reports WHERE report_status = 'pending')::int AS pending_reports,
            (SELECT MIN(created_at) FROM tb_incident_reports WHERE report_status = 'pending') AS oldest_pending_at,
            (SELECT COUNT(*) FROM tb_incidents WHERE incident_status = 'active')::int AS active_incidents,
            (SELECT COUNT(*) FROM tb_help_requests
                WHERE request_status IN ('pending', 'accepted', 'in_progress')
                  AND expires_at > CURRENT_TIMESTAMP)::int AS open_help_requests,
            (SELECT COUNT(*) FROM tb_users)::int AS total_users,
            (SELECT COUNT(*) FROM tb_users
                WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days')::int AS new_users_7d`
    );
    return result.rows[0];
};

// จำนวนรายงานรายวันย้อนหลัง (รวมวันนี้) แยกตามสถานะการตรวจสอบ
// ใช้ generate_series ให้วันที่ไม่มีรายงานยังอยู่ในผลลัพธ์ (จำนวน = 0)
const getDailyReportCounts = async (days) => {
    const result = await db.query(
        `SELECT
            TO_CHAR(day::date, 'YYYY-MM-DD') AS day,
            COUNT(r.report_id)::int AS total,
            COUNT(r.report_id) FILTER (WHERE r.report_status = 'verified')::int AS verified,
            COUNT(r.report_id) FILTER (WHERE r.report_status = 'pending')::int AS pending,
            COUNT(r.report_id) FILTER (WHERE r.report_status = 'rejected')::int AS rejected
         FROM generate_series(CURRENT_DATE - ($1::int - 1), CURRENT_DATE, INTERVAL '1 day') AS day
         LEFT JOIN tb_incident_reports r ON r.created_at::date = day::date
         GROUP BY day
         ORDER BY day`,
        [days]
    );
    return result.rows;
};

// จำนวนรายงานตามประเภทเหตุการณ์ในช่วงวันที่กำหนด
// ประเภทใช้ค่าที่ยืนยันแล้วก่อน ถ้ายังไม่มีใช้ค่าที่ผู้ใช้เลือก ถ้าไม่มีทั้งคู่จะเป็น "ยังไม่ระบุประเภท" (type_code = null)
const getReportCountsByType = async (days) => {
    const result = await db.query(
        `SELECT
            t.type_code,
            t.type_name,
            COUNT(r.report_id)::int AS total
         FROM tb_incident_reports r
         LEFT JOIN tb_incident_types t ON t.type_id = COALESCE(r.final_type_id, r.user_selected_type_id)
         WHERE r.created_at >= CURRENT_DATE - ($1::int - 1)
         GROUP BY t.type_code, t.type_name
         ORDER BY total DESC`,
        [days]
    );
    return result.rows;
};

// รายงานล่าสุด (ไม่ส่งตำแหน่งของผู้รายงาน ซึ่งเป็นข้อมูลภายใน)
const getLatestReports = async (limit) => {
    const result = await db.query(
        `SELECT
            r.report_id,
            r.incident_id,
            LEFT(r.description, 120) AS description,
            r.report_status,
            r.is_suspicious,
            r.created_at,
            t.type_code,
            t.type_name
         FROM tb_incident_reports r
         LEFT JOIN tb_incident_types t ON t.type_id = COALESCE(r.final_type_id, r.user_selected_type_id)
         ORDER BY r.created_at DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows;
};

// คำขอความช่วยเหลือล่าสุด
const getLatestHelpRequests = async (limit) => {
    const result = await db.query(
        `SELECT
            help_request_id,
            help_type,
            custom_help_type,
            LEFT(description, 120) AS description,
            people_count,
            request_status,
            created_at
         FROM tb_help_requests
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows;
};

module.exports = {
    getSummary,
    getDailyReportCounts,
    getReportCountsByType,
    getLatestReports,
    getLatestHelpRequests,
};
