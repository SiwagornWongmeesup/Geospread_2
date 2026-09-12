const { body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');

/**
 * registerValidator
 * -----------------------------------------------------------------------
 * ใช้กับ POST /users (สมัครสมาชิก)
 */
const registerValidator = [
    body('email')
        .notEmpty().withMessage('กรุณากรอกอีเมล')
        .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('กรุณากรอกรหัสผ่าน')
        .isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),

    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('ชื่อต้องไม่เกิน 100 ตัวอักษร'),

    body('phone')
        .optional()
        .isMobilePhone('th-TH').withMessage('เบอร์โทรศัพท์ไม่ถูกต้อง'),

    validateRequest
];

/**
 * loginValidator
 * -----------------------------------------------------------------------
 * ใช้กับ POST /users/login (เข้าสู่ระบบ)
 */
const loginValidator = [
    body('email')
        .notEmpty().withMessage('กรุณากรอกอีเมล')
        .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('กรุณากรอกรหัสผ่าน'),

    validateRequest
];

/**
 * getUserByIdValidator
 * -----------------------------------------------------------------------
 * ใช้กับ GET /users/:id
 */
const getUserByIdValidator = [
    param('id')
        .notEmpty().withMessage('กรุณาระบุ User ID')
        .isInt({ min: 1 }).withMessage('User ID ต้องเป็นตัวเลขที่มากกว่า 0')
        .toInt(),

    validateRequest
];

module.exports = {
    registerValidator,
    loginValidator,
    getUserByIdValidator
};
