// controllers/adminOverviewController.js
// รับ Request ของแดชบอร์ดผู้ดูแลระบบ แล้วส่งต่อให้ Service (ไม่มี Business Logic ในนี้)
const adminOverviewService = require('../services/adminOverviewService');

// GET /incidents/admin/overview
const getAdminOverview = async (req, res, next) => {
    try {
        const overview = await adminOverviewService.getAdminOverview();
        res.status(200).json({ success: true, data: overview });
    } catch (error) {
        // ให้ Error ไหลไปที่ errorHandler.js
        next(error);
    }
};

module.exports = {
    getAdminOverview,
};
