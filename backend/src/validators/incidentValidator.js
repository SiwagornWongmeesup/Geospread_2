const { body, param, query } = require('express-validator');
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
const reportTypeSuggestionCacheValidator = [validateRequest];
const publicMapValidator = [validateRequest];
const adminReviewQueueValidator = [validateRequest];

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

    body('user_selected_type_id')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 }).withMessage('รหัสประเภทเหตุการณ์ไม่ถูกต้อง')
        .toInt(),

    validateRequest,
];

const candidateDecisionValidator = [
    param('candidateId')
        .isInt({ min: 1 }).withMessage('รหัส Candidate ไม่ถูกต้อง')
        .toInt(),
    body('action')
        .isIn(['accept', 'reject']).withMessage('การตัดสิน Candidate ไม่ถูกต้อง'),
    validateRequest,
];

const candidateGroupDecisionValidator = [
    param('candidateGroupId')
        .isInt({ min: 1 }).withMessage('รหัส Candidate Group ไม่ถูกต้อง')
        .toInt(),
    body('action')
        .isIn(['accept', 'reject']).withMessage('การตัดสิน Candidate Group ไม่ถูกต้อง'),
    body('type_id')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 }).withMessage('รหัส Type ไม่ถูกต้อง')
        .toInt(),
    body('target_incident_id')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 }).withMessage('รหัส Incident เป้าหมายไม่ถูกต้อง')
        .toInt(),
    validateRequest,
];

const createIncidentFromPendingReportValidator = [
    param('reportId')
        .isInt({ min: 1 }).withMessage('รหัส Report ไม่ถูกต้อง')
        .toInt(),
    body('type_id')
        .isInt({ min: 1 }).withMessage('Administrator ต้องเลือก Type')
        .toInt(),
    validateRequest,
];

const rejectStandalonePendingReportValidator = [
    param('reportId')
        .isInt({ min: 1 }).withMessage('รหัส Report ไม่ถูกต้อง')
        .toInt(),
    validateRequest,
];

const separateReportValidator = [
    param('reportId')
        .isInt({ min: 1 }).withMessage('รหัส Report ไม่ถูกต้อง')
        .toInt(),
    body('type_id')
        .isInt({ min: 1 }).withMessage('Administrator ต้องเลือก Type')
        .toInt(),
    validateRequest,
];

module.exports = {
    suggestedTypesValidator,
    incidentCatalogValidator,
    reportTypeSuggestionCacheValidator,
    publicMapValidator,
    adminReviewQueueValidator,
    reportValidator,
    candidateDecisionValidator,
    candidateGroupDecisionValidator,
    createIncidentFromPendingReportValidator,
    rejectStandalonePendingReportValidator,
    separateReportValidator,
};
