// services/adminOverviewService.js
// -------------------------------------------------------------------------
// Business Logic ของแดชบอร์ดผู้ดูแลระบบ: รวมข้อมูลสรุปทุกส่วนเป็นก้อนเดียว
// -------------------------------------------------------------------------
const adminOverviewRepository = require('../repositories/adminOverviewRepository');

// ช่วงเวลาของกราฟและจำนวนรายการล่าสุดที่แสดงบนแดชบอร์ด
const TREND_DAYS = 7;
const TYPE_DAYS = 30;
const LATEST_LIMIT = 5;

const getAdminOverview = async () => {
    // ดึงทุกส่วนพร้อมกัน เพราะแต่ละส่วนไม่ขึ้นต่อกัน
    const [summary, dailyReports, reportsByType, latestReports, latestHelpRequests] = await Promise.all([
        adminOverviewRepository.getSummary(),
        adminOverviewRepository.getDailyReportCounts(TREND_DAYS),
        adminOverviewRepository.getReportCountsByType(TYPE_DAYS),
        adminOverviewRepository.getLatestReports(LATEST_LIMIT),
        adminOverviewRepository.getLatestHelpRequests(LATEST_LIMIT),
    ]);

    return {
        summary,
        trend_days: TREND_DAYS,
        daily_reports: dailyReports,
        type_days: TYPE_DAYS,
        reports_by_type: reportsByType,
        latest_reports: latestReports,
        latest_help_requests: latestHelpRequests,
    };
};

module.exports = {
    getAdminOverview,
};
