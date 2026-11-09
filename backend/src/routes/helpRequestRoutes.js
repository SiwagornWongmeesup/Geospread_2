const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const uploadHelpRequestMedia = require('../middlewares/uploadHelpRequestMedia');
const {
    createHelpRequestValidator,
    helpRequestDetailValidator,
    createOfferValidator,
    respondToOfferValidator,
    updateRequestStatusValidator,
    createUserReportValidator,
} = require('../validators/helpRequestValidator');

// POST /help-requests — ส่งคำขอความช่วยเหลือ (multipart: ข้อมูลฟอร์ม + รูปในช่อง media สูงสุด 5 รูป)
router.post('/',
    authMiddleware,
    uploadHelpRequestMedia,
    createHelpRequestValidator,
    helpRequestController.createHelpRequest);

// GET /help-requests/map — คำขอที่รอความช่วยเหลือ + มีผู้ช่วยแล้ว พิกัดคร่าวๆ (ต้องอยู่ก่อน /:helpRequestId)
router.get('/map',
    helpRequestController.getActiveHelpRequests);

// GET /help-requests/mine — คำขอของฉัน + คำขอที่ฉันเสนอช่วย (ต้องอยู่ก่อน /:helpRequestId)
router.get('/mine',
    authMiddleware,
    helpRequestController.getMyHelp);

// GET /help-requests/:helpRequestId — รายละเอียดเต็ม (ล็อกอินแล้วจะเห็นข้อมูลตามสิทธิ์ของตัวเอง)
router.get('/:helpRequestId',
    optionalAuthMiddleware,
    helpRequestDetailValidator,
    helpRequestController.getHelpRequestDetail);

// POST /help-requests/:helpRequestId/offers — เสนอช่วยเหลือ
router.post('/:helpRequestId/offers',
    authMiddleware,
    createOfferValidator,
    helpRequestController.createOffer);

// PATCH /help-requests/:helpRequestId/offers/:offerId — เจ้าของรับ/ปฏิเสธ หรือผู้ช่วยถอนข้อเสนอ
router.patch('/:helpRequestId/offers/:offerId',
    authMiddleware,
    respondToOfferValidator,
    helpRequestController.respondToOffer);

// PATCH /help-requests/:helpRequestId/status — เจ้าของ: ได้รับความช่วยเหลือแล้ว / ยกเลิก / ปลดผู้ช่วย
router.patch('/:helpRequestId/status',
    authMiddleware,
    updateRequestStatusValidator,
    helpRequestController.updateRequestStatus);

// POST /help-requests/:helpRequestId/reports — รายงานผู้ใช้ที่น่าสงสัย
router.post('/:helpRequestId/reports',
    authMiddleware,
    createUserReportValidator,
    helpRequestController.createUserReport);

module.exports = router;
