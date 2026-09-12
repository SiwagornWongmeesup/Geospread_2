const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * validateRequest
 * -----------------------------------------------------------------------
 * Middleware กลาง: ดักผลลัพธ์จาก express-validator
 * ต้องวางหลัง validator array เสมอใน route
 *
 * ตัวอย่างการใช้งาน:
 *   router.post('/', registerValidator, validateRequest, controller.create)
 * -----------------------------------------------------------------------
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // จัดรูปแบบ error ให้อ่านง่าย: [{ field, message }]
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        return next(new AppError('Validation failed', 400, formattedErrors));
    }

    next();
};

module.exports = validateRequest;
