const AppError = require('../utils/AppError');

/**
 * checkRole
 * -----------------------------------------------------------------------
 * Middleware Factory: ตรวจสอบ role ของผู้ใช้
 * ต้องใช้ร่วมกับ authMiddleware เสมอ (เพราะต้องการ req.user)
 *
 * ตัวอย่างการใช้งาน:
 *   // เฉพาะ admin เท่านั้น
 *   router.delete('/:id', authMiddleware, checkRole('admin'), controller.delete)
 *
 *   // admin หรือ moderator
 *   router.patch('/:id', authMiddleware, checkRole('admin', 'moderator'), controller.update)
 * -----------------------------------------------------------------------
 * @param {...string} roles - role ที่อนุญาตให้เข้าถึง
 */
const checkRole = (...roles) => {
    return (req, res, next) => {
        // req.user ต้องมาจาก authMiddleware ก่อน
        if (!req.user) {
            return next(new AppError('กรุณาเข้าสู่ระบบก่อน', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(
                `คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (ต้องการ role: ${roles.join(' หรือ ')})`,
                403
            ));
        }

        next();
    };
};

module.exports = checkRole;
