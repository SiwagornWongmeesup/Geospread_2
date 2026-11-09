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

const helpRequestIdParam = param('helpRequestId')
    .isInt({ min: 1 }).withMessage('รหัสคำขอความช่วยเหลือไม่ถูกต้อง')
    .toInt();

// GET /help-requests/:helpRequestId
const helpRequestDetailValidator = [
    helpRequestIdParam,
    validateRequest,
];

// POST /help-requests/:helpRequestId/offers
const createOfferValidator = [
    helpRequestIdParam,
    body('message')
        .optional({ values: 'null' })
        .isString().withMessage('ข้อความต้องเป็นข้อความ')
        .bail()
        .trim()
        .isLength({ max: 500 }).withMessage('ข้อความต้องไม่เกิน 500 ตัวอักษร'),
    validateRequest,
];

// PATCH /help-requests/:helpRequestId/offers/:offerId
const respondToOfferValidator = [
    helpRequestIdParam,
    param('offerId')
        .isInt({ min: 1 }).withMessage('รหัสข้อเสนอไม่ถูกต้อง')
        .toInt(),
    body('action')
        .isIn(['accept', 'decline', 'withdraw']).withMessage('action ต้องเป็น accept, decline หรือ withdraw'),
    // ตอนรับข้อเสนอ: ช่องทางที่ผู้ขอเลือกแชร์ (service เช็คว่าต้องเลือกอย่างน้อย 1 ช่อง)
    body('share_phone')
        .optional()
        .isBoolean({ strict: true }).withMessage('share_phone ต้องเป็น true หรือ false'),
    body('share_line')
        .optional()
        .isBoolean({ strict: true }).withMessage('share_line ต้องเป็น true หรือ false'),
    validateRequest,
];

// PATCH /help-requests/:helpRequestId/status
const updateRequestStatusValidator = [
    helpRequestIdParam,
    body('action')
        .isIn(['resolve', 'cancel', 'release_helper']).withMessage('action ต้องเป็น resolve, cancel หรือ release_helper'),
    validateRequest,
];

// POST /help-requests/:helpRequestId/reports
const createUserReportValidator = [
    helpRequestIdParam,
    body('offer_id')
        .optional({ values: 'null' })
        .isInt({ min: 1 }).withMessage('รหัสข้อเสนอไม่ถูกต้อง')
        .toInt(),
    body('reason')
        .isIn(['asked_money', 'no_show', 'fake_request', 'harassment', 'other']).withMessage('เหตุผลการรายงานไม่ถูกต้อง'),
    body('details')
        .optional({ values: 'null' })
        .isString().withMessage('รายละเอียดต้องเป็นข้อความ')
        .bail()
        .trim()
        .isLength({ max: 500 }).withMessage('รายละเอียดต้องไม่เกิน 500 ตัวอักษร'),
    validateRequest,
];

module.exports = {
    createHelpRequestValidator,
    helpRequestDetailValidator,
    createOfferValidator,
    respondToOfferValidator,
    updateRequestStatusValidator,
    createUserReportValidator,
}
