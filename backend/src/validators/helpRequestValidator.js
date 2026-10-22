const { body, param, query } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');

const createHelpRequestValidator = [
    body('help_type')
        .isIn(['evacuation', 'medical', 'food', 'shelter', 'vehicle', 'other'])
        .withMessage('ประเภทความช่วยเหลือไม่ถูกต้อง'),

    body('custom_help_type')
        .optional({ values: 'falsy' })
        .isString().withMessage('รายละเอียดประเภทความช่วยเหลือต้องเป็นข้อความ')
        .bail()
        .trim()
        .isLength({ max: 255 }).withMessage('รายละเอียดประเภทความช่วยเหลือต้องไม่เกิน 255 ตัวอักษร'),

    body('description')
        .isString().withMessage('รายละเอียดคำขอความช่วยเหลือต้องเป็นข้อความ')
        .bail()
        .trim()
        .isLength({ min: 5, max: 1000 }).withMessage('รายละเอียดคำขอความช่วยเหลือต้องมี 5 ถึง 1000 ตัวอักษร'),

    body('people_count')
        .isInt({ min: 1, max: 999 }).withMessage('จำนวนผู้ที่ต้องการความช่วยเหลือต้องอยู่ระหว่าง 1 ถึง 999 คน')
        .toInt(),

    body('lat')
        .isFloat({ min: -90, max: 90 }).withMessage('ละติจูดจุดที่ต้องการความช่วยเหลือไม่ถูกต้อง')
        .toFloat(),

    body('lng')
        .isFloat({ min: -180, max: 180 }).withMessage('ลองจิจูดจุดที่ต้องการความช่วยเหลือไม่ถูกต้อง')
        .toFloat(),

    body('location_source')
        .isIn(['device', 'map', 'unknown']).withMessage('แหล่งที่มาของตำแหน่งไม่ถูกต้อง'),

    validateRequest,
];

module.exports = {
    createHelpRequestValidator,
}
