const helpRequestService = require('../services/helprequestService');

const createHelpRequest = async (req, res, next) => {
    try {
        const helpRequest = await helpRequestService.createHelpRequestService(
            req.body,
            req.user.id
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

const getPublicHelpRequestDetail = async (req, res, next) => {
    try {
        const helpRequest = await helpRequestService.getPublicHelpRequestDetailService(req.params.helpRequestId);
        res.status(200).json({ success: true, data: helpRequest });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createHelpRequest,
    getActiveHelpRequests,
    getPublicHelpRequestDetail,
}
