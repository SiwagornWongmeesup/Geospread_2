const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * authMiddleware
 * -----------------------------------------------------------------------
 * ตรวจสอบ JWT Token จาก Authorization header
 * ถ้าถูกต้อง → แนบ req.user ไปให้ middleware/controller ถัดไป
 * ถ้าไม่มีหรือหมดอายุ → ส่ง 401 Unauthorized
 *
 * ตัวอย่างการใช้งาน:
 *   router.get('/profile', authMiddleware, controller.getProfile)
 * -----------------------------------------------------------------------
 */
const authMiddleware = (req, res, next) => {
    // ดึง token จาก header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('กรุณาเข้าสู่ระบบก่อน', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', 401));
        }
        return next(new AppError('Token ไม่ถูกต้อง', 401));
    }
};

module.exports = authMiddleware;
