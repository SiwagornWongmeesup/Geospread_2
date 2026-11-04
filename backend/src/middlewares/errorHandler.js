const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    // กำหนดค่าเริ่มต้นถ้าไม่ได้ระบุ
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // ถ้าไม่ใช่ Operational Error (เช่น โค้ดพังเอง ไม่ได้ throw AppError)
    // ใน production เราอาจจะไม่ส่งรายละเอียด stack ออกไป
    if (!err.isOperational) {
        console.error('🔥 ERROR (Unhandled):', err);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code || null,
        errors: err.errors || null,
        // (Optional) เปิด stack trace ตอน dev ได้
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
