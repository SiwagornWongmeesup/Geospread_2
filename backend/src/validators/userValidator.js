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

// PATCH /users/me — แก้ข้อมูลส่วนตัว (กฎเดียวกับฟอร์มในหน้าโปรไฟล์)
// ช่องที่ไม่บังคับ ส่งข้อความว่างมาได้ = ลบค่าเดิมออก
const updateMyProfileValidator = [
    body('name')
        .exists().withMessage('กรุณากรอกชื่อ')
        .bail()
        .isString().withMessage('ชื่อต้องเป็นข้อความ')
        .trim()
        .notEmpty().withMessage('กรุณากรอกชื่อ')
        .isLength({ max: 50 }).withMessage('ชื่อต้องไม่เกิน 50 ตัวอักษร'),

    body('lastname')
        .optional({ values: 'null' })
        .isString().withMessage('นามสกุลต้องเป็นข้อความ')
        .trim()
        .isLength({ max: 50 }).withMessage('นามสกุลต้องไม่เกิน 50 ตัวอักษร'),

    // เบอร์ไทย 9–10 หลัก เว้นวรรคหรือขีดได้
    body('phone')
        .optional({ values: 'falsy' })
        .isString().withMessage('เบอร์โทรศัพท์ต้องเป็นข้อความ')
        .trim()
        .matches(/^0[\d\s-]{8,18}$/).withMessage('เบอร์โทรศัพท์ต้องเป็นตัวเลข 9–10 หลัก')
        .isLength({ max: 20 }).withMessage('เบอร์โทรศัพท์ยาวเกินไป'),

    body('line_id')
        .optional({ values: 'falsy' })
        .isString().withMessage('LINE ID ต้องเป็นข้อความ')
        .trim()
        .matches(/^[a-zA-Z0-9._-]{4,20}$/).withMessage('LINE ID ต้องเป็นตัวอักษรอังกฤษ ตัวเลข . _ - ยาว 4–20 ตัว'),

    body('instagram')
        .optional({ values: 'falsy' })
        .isString().withMessage('Instagram ต้องเป็นข้อความ')
        .trim()
        .matches(/^@?[a-zA-Z0-9._]{1,30}$/).withMessage('ชื่อผู้ใช้ Instagram ต้องเป็นตัวอักษรอังกฤษ ตัวเลข . _ ไม่เกิน 30 ตัว'),

    validateRequest
];

const getUserByIdValidator = [
    param('id')
        .notEmpty().withMessage('กรุณาระบุ User ID')
        .isInt({ min: 1 }).withMessage('User ID ต้องเป็นตัวเลขที่มากกว่า 0')
        .toInt(),

    validateRequest
];

module.exports = {
    getMyProfileValidator,
    updateMyProfileValidator,
    registerValidator,
    loginValidator,
    verifyEmailValidator,
    resendVerificationValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    getUserByIdValidator
};
