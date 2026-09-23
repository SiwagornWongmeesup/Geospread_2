const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const authMiddleware = require('../middlewares/authMiddleware');
const reportRateLimit = require('../middlewares/reportRateLimit');
const uploadIncidentMedia = require('../middlewares/uploadIncidentMedia');
const { incidentCatalogValidator, reportValidator, suggestedTypesValidator } = require('../validators/incidentValidator');

// Public: ใช้แนะนำเท่านั้น จึงไม่ต้อง login และไม่สร้างข้อมูลใด ๆ
router.get('/catalog', incidentCatalogValidator, incidentController.getIncidentTypeCatalog);
router.get('/suggestions', suggestedTypesValidator, incidentController.getSuggestedIncidentTypes);

// รายงานสร้างข้อมูลและไฟล์จริง จึงต้องผูกกับบัญชีผู้ใช้และจำกัดความถี่การส่ง
router.post('/', authMiddleware, reportRateLimit, uploadIncidentMedia, reportValidator, incidentController.createIncident);

module.exports = router;
