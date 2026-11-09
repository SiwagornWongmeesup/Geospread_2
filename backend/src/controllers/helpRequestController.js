const helpRequestService = require('../services/helprequestService');

const createHelpRequest = async (req, res, next) => {
    try {
        // รูปที่แนบมา (multer ใส่ไว้ใน req.files)
        let files = []
        if (Array.isArray(req.files)) {
            files = req.files
        }
        const helpRequest = await helpRequestService.createHelpRequestService(
            req.body,
            req.user.id,
            files
        )
        res.status(201).json({
            success: true,
            message: 'ส่งคำขอความช่วยเหลือสำเร็จ',
            data: {
                help_request_id: helpRequest.help_request_id,
                request_status: helpRequest.request_status,
                expires_at: helpRequest.expires_at,
                created_at: helpRequest.created_at
            }
        })
    } catch (err) {
        next(err)
    }
}

const getActiveHelpRequests = async (req, res, next) => {
    try {
        const helpRequests =
            await helpRequestService.getActiveHelpRequestsService();

        res.status(200).json({
            success: true,
            data: helpRequests
        });
    } catch (err) {
        next(err);
    }
};

// รายละเอียดคำขอ 1 รายการ (ล็อกอินหรือไม่ก็ได้ ข้อมูลที่ได้ขึ้นกับว่าใครเปิดดู)
const getHelpRequestDetail = async (req, res, next) => {
    try {
        let viewerId = null
        if (req.user) {
            viewerId = req.user.id
        }
        const detail = await helpRequestService.getHelpRequestDetailService(req.params.helpRequestId, viewerId)
        res.status(200).json({ success: true, data: detail })
    } catch (err) {
        next(err)
    }
}

// เสนอช่วยเหลือ
const createOffer = async (req, res, next) => {
    try {
        const offer = await helpRequestService.createOfferService(
            req.params.helpRequestId,
            req.user.id,
            req.body.message
        )
        res.status(201).json({ success: true, message: 'ส่งข้อเสนอช่วยเหลือแล้ว', data: offer })
    } catch (err) {
        next(err)
    }
}

// เจ้าของคำขอรับ/ปฏิเสธข้อเสนอ หรือผู้ช่วยถอนข้อเสนอของตัวเอง
const respondToOffer = async (req, res, next) => {
    try {
        const detail = await helpRequestService.respondToOfferService({
            helpRequestId: req.params.helpRequestId,
            offerId: req.params.offerId,
            userId: req.user.id,
            action: req.body.action,
            sharePhone: req.body.share_phone === true,
            shareLine: req.body.share_line === true,
        })
        res.status(200).json({ success: true, data: detail })
    } catch (err) {
        next(err)
    }
}

// คำขอของฉัน + คำขอที่ฉันเสนอช่วย
const getMyHelp = async (req, res, next) => {
    try {
        const data = await helpRequestService.getMyHelpService(req.user.id)
        res.status(200).json({ success: true, data })
    } catch (err) {
        next(err)
    }
}

// เจ้าของเปลี่ยนสถานะคำขอ: resolve / cancel / release_helper
const updateRequestStatus = async (req, res, next) => {
    try {
        const detail = await helpRequestService.updateRequestStatusService({
            helpRequestId: req.params.helpRequestId,
            userId: req.user.id,
            action: req.body.action,
        })
        res.status(200).json({ success: true, data: detail })
    } catch (err) {
        next(err)
    }
}

// รายงานผู้ใช้ที่น่าสงสัยในคำขอนี้
const createUserReport = async (req, res, next) => {
    try {
        let offerId = null
        if (req.body.offer_id) {
            offerId = req.body.offer_id
        }
        const report = await helpRequestService.createUserReportService({
            helpRequestId: req.params.helpRequestId,
            reporterId: req.user.id,
            offerId,
            reason: req.body.reason,
            details: req.body.details,
        })
        res.status(201).json({ success: true, message: 'ส่งรายงานแล้ว', data: report })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    createHelpRequest,
    getActiveHelpRequests,
    getMyHelp,
    getHelpRequestDetail,
    createOffer,
    respondToOffer,
    updateRequestStatus,
    createUserReport,
}
