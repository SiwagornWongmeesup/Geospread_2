const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const reportRateLimit = require('../middlewares/reportRateLimit');
const uploadIncidentMedia = require('../middlewares/uploadIncidentMedia');
const {
    adminReviewQueueValidator,
    candidateDecisionValidator,
    candidateGroupDecisionValidator,
    createIncidentFromPendingReportValidator,
    falseIncidentReportValidator,
    incidentCatalogValidator,
    publicMapValidator,
    rejectStandalonePendingReportValidator,
    reportTypeSuggestionCacheValidator,
    reportValidator,
    separateReportValidator,
    suggestedTypesValidator,
} = require('../validators/incidentValidator');

// Public: ใช้แนะนำเท่านั้น จึงไม่ต้อง login และไม่สร้างข้อมูลใด ๆ
router.get('/catalog', incidentCatalogValidator, incidentController.getIncidentTypeCatalog);
router.get('/report-type-cache', reportTypeSuggestionCacheValidator, incidentController.getReportTypeSuggestionCache);
router.get('/suggestions', suggestedTypesValidator, incidentController.getSuggestedIncidentTypes);
router.get('/map', publicMapValidator, incidentController.getPublicMapItems);

router.post('/:incidentId/false-reports', authMiddleware, reportRateLimit, falseIncidentReportValidator, incidentController.reportFalseIncident);

// Candidate และ Candidate Group เป็นข้อมูลตรวจสอบภายใน ไม่เปิดให้ Community User เห็น
router.get('/admin/review-queue', authMiddleware, checkRole('admin'), adminReviewQueueValidator, incidentController.getAdminReviewQueue);
router.patch('/admin/report-candidates/:candidateId', authMiddleware, checkRole('admin'), candidateDecisionValidator, incidentController.reviewReportCandidate);
router.patch('/admin/candidate-groups/:candidateGroupId', authMiddleware, checkRole('admin'), candidateGroupDecisionValidator, incidentController.reviewCandidateGroup);
router.post('/admin/pending-reports/:reportId/confirm-type', authMiddleware, checkRole('admin'), createIncidentFromPendingReportValidator, incidentController.createIncidentFromPendingReport);
router.patch('/admin/pending-reports/:reportId/reject', authMiddleware, checkRole('admin'), rejectStandalonePendingReportValidator, incidentController.rejectStandalonePendingReport);
router.post('/admin/reports/:reportId/separate', authMiddleware, checkRole('admin'), separateReportValidator, incidentController.separateReportFromIncident);

// รายงานสร้างข้อมูลและไฟล์จริง จึงต้องผูกกับบัญชีผู้ใช้และจำกัดความถี่การส่ง
router.post('/', authMiddleware, reportRateLimit, uploadIncidentMedia, reportValidator, incidentController.createIncident);

module.exports = router;
