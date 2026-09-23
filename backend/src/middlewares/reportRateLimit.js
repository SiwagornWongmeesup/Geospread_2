const AppError = require('../utils/AppError');

// MVP: จำกัดตามบัญชีที่ยืนยันตัวตนแล้ว เพื่อกันการยิงรายงานถี่ ๆ
// หาก deploy หลาย instance ให้ย้าย store นี้ไป Redis เพื่อให้ทุก server ใช้ quota เดียวกัน
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REPORTS_PER_WINDOW = 3;
const requestsByUser = new Map();

const reportRateLimit = (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return next(new AppError('กรุณาเข้าสู่ระบบก่อน', 401));

    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const requestsInWindow = (requestsByUser.get(userId) ?? []).filter((timestamp) => timestamp > windowStart);

    if (requestsInWindow.length >= MAX_REPORTS_PER_WINDOW) {
        const retryAfterSeconds = Math.ceil((requestsInWindow[0] + WINDOW_MS - now) / 1000);
        res.set('Retry-After', String(retryAfterSeconds));
        return next(new AppError(`ส่งรายงานได้สูงสุด 3 ครั้งใน 5 นาที กรุณาลองอีกครั้งใน ${retryAfterSeconds} วินาที`, 429));
    }

    requestsInWindow.push(now);
    requestsByUser.set(userId, requestsInWindow);
    return next();
};

module.exports = reportRateLimit;
