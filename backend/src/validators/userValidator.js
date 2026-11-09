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
 * verifyEmailValidator — POST /users/verify-email
 */
const verifyEmailValidator = [
    body('email')
        .notEmpty().withMessage('กรุณากรอกอีเมล')
        .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(),

    body('code')
        .trim()
        .matches(/^\d{6}$/).withMessage('รหัสยืนยันต้องเป็นตัวเลข 6 หลัก'),

    validateRequest
];

/**
 * resendVerificationValidator — POST /users/resend-verification
 */
const resendVerificationValidator = [
    body('email')
        .notEmpty().withMessage('กรุณากรอกอีเมล')
        .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(),

    validateRequest
];

/**
 * forgotPasswordValidator — POST /users/forgot-password
 */
const forgotPasswordValidator = resendVerificationValidator;

/**
 * resetPasswordValidator — POST /users/reset-password
 */
const resetPasswordValidator = [
    body('email')
        .notEmpty().withMessage('กรุณากรอกอีเมล')
        .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(),

    body('code')
        .trim()
        .matches(/^\d{6}$/).withMessage('รหัสต้องเป็นตัวเลข 6 หลัก'),

    body('password')
        .notEmpty().withMessage('กรุณากรอกรหัสผ่านใหม่')
        .isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),

    validateRequest
];

/**
 * getUserByIdValidator
 * -----------------------------------------------------------------------
 * ใช้กับ GET /users/:id
 */
// GET /users/me ไม่มี input (ใช้ id จาก token) จึงตรวจแค่ผลของ validateRequest
const getMyProfileValidator = [validateRequest];

const getUserByIdValidator = [
    param('id')
        .notEmpty().withMessage('กรุณาระบุ User ID')
        .isInt({ min: 1 }).withMessage('User ID ต้องเป็นตัวเลขที่มากกว่า 0')
        .toInt(),

    validateRequest
];

module.exports = {
    getMyProfileValidator,
    registerValidator,
    loginValidator,
    verifyEmailValidator,
    resendVerificationValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    getUserByIdValidator
};
