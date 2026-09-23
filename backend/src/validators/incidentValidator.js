const { body, query } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');

const suggestedTypesValidator = [
    query('description')
        .trim()
        .isLength({ min: 2, max: 500 }).withMessage('รายละเอียดเหตุการณ์ต้องมี 2 ถึง 500 ตัวอักษร'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 3 }).withMessage('จำนวนคำแนะนำต้องอยู่ระหว่าง 1 ถึง 3')
        .toInt(),

    validateRequest,
];

// ไม่มี input จากผู้ใช้ แต่คงผ่าน validateRequest เพื่อให้ route ใช้มาตรฐานเดียวกัน
const incidentCatalogValidator = [validateRequest];

const reportValidator = [
    body('description')
        .trim()
        .isLength({ min: 5, max: 500 }).withMessage('รายละเอียดเหตุการณ์ต้องมี 5 ถึง 500 ตัวอักษร'),

    body('lat')
        .isFloat({ min: -90, max: 90 }).withMessage('ละติจูดจุดเกิดเหตุไม่ถูกต้อง')
        .toFloat(),

    body('lng')
        .isFloat({ min: -180, max: 180 }).withMessage('ลองจิจูดจุดเกิดเหตุไม่ถูกต้อง')
        .toFloat(),

    body('reporter_lat')
        .optional({ values: 'falsy' })
        .isFloat({ min: -90, max: 90 }).withMessage('ละติจูดผู้รายงานไม่ถูกต้อง')
        .toFloat(),

    body('reporter_lng')
        .optional({ values: 'falsy' })
        .isFloat({ min: -180, max: 180 }).withMessage('ลองจิจูดผู้รายงานไม่ถูกต้อง')
        .toFloat(),

    body(['user_selected_type_id', 'system_suggested_type_id'])
        .optional({ values: 'falsy' })
        .isInt({ min: 1 }).withMessage('รหัสประเภทเหตุการณ์ไม่ถูกต้อง')
        .toInt(),

    body('custom_type')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 150 }).withMessage('ประเภทเหตุการณ์ที่ระบุเองต้องไม่เกิน 150 ตัวอักษร'),

    validateRequest,
];

module.exports = {
    suggestedTypesValidator,
    incidentCatalogValidator,
    reportValidator,
};
