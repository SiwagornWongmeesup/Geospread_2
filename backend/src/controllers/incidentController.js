const incidentService = require('../services/incidentService');

const createIncident = async (req, res, next) => {
    try {
        const incidentData = {
            ...req.body,
            user_id: req.user.id,
            media: req.files ?? [],
        }
        const report = await incidentService.createIncident(incidentData)
        res.status(201).json({
            success: true,
            message: 'ส่งรายงานเหตุการณ์สำเร็จ',
            data: report
        });
    } catch (error) {
        next(error);
    }
}

const getSuggestedIncidentTypes = async (req, res, next) => {
    try {
        const suggestedTypes = await incidentService.getSuggestedIncidentTypes(req.query);

        res.json({
            success: true,
            data: suggestedTypes,
        });
    } catch (error) {
        next(error);
    }
};

const getIncidentTypeCatalog = async (req, res, next) => {
    try {
        const catalog = await incidentService.getIncidentTypeCatalog();

        res.json({
            success: true,
            data: catalog,
        });
    } catch (error) {
        next(error);
    }
};

const getReportTypeSuggestionCache = async (req, res, next) => {
    try {
        const cache = await incidentService.getReportTypeSuggestionCache();
        res.json({ success: true, data: cache });
    } catch (error) {
        next(error);
    }
};

const getPublicMapItems = async (req, res, next) => {
    try {
        const mapItems = await incidentService.getPublicMapItems();
        res.json({ success: true, data: mapItems });
    } catch (error) {
        next(error);
    }
};

const getAdminReviewQueue = async (req, res, next) => {
    try {
        const reviewQueue = await incidentService.getAdminReviewQueue();
        res.json({ success: true, data: reviewQueue });
    } catch (error) {
        next(error);
    }
};

const reviewReportCandidate = async (req, res, next) => {
    try {
        const result = await incidentService.reviewReportCandidate({
            candidateId: req.params.candidateId,
            action: req.body.action,
            adminId: req.user.id,
        });
        res.json({ success: true, message: 'ตรวจสอบ Candidate สำเร็จ', data: result });
    } catch (error) {
        next(error);
    }
};

const reviewCandidateGroup = async (req, res, next) => {
    try {
        const result = await incidentService.reviewCandidateGroup({
            candidateGroupId: req.params.candidateGroupId,
            action: req.body.action,
            typeId: req.body.type_id,
            targetIncidentId: req.body.target_incident_id,
            adminId: req.user.id,
        });
        res.json({ success: true, message: 'ตรวจสอบ Candidate Group สำเร็จ', data: result });
    } catch (error) {
        next(error);
    }
};

const createIncidentFromPendingReport = async (req, res, next) => {
    try {
        const result = await incidentService.createIncidentFromPendingReport({
            reportId: req.params.reportId,
            typeId: req.body.type_id,
            adminId: req.user.id,
        });
        res.status(201).json({ success: true, message: 'ยืนยัน Type และจัดการ Incident สำเร็จ', data: result });
    } catch (error) {
        next(error);
    }
};

const rejectStandalonePendingReport = async (req, res, next) => {
    try {
        const result = await incidentService.rejectStandalonePendingReport({
            reportId: req.params.reportId,
            adminId: req.user.id,
        });
        res.json({ success: true, message: 'ปฏิเสธ Report สำเร็จ', data: result });
    } catch (error) {
        next(error);
    }
};

const separateReportFromIncident = async (req, res, next) => {
    try {
        const result = await incidentService.separateReportFromIncident({
            reportId: req.params.reportId,
            typeId: req.body.type_id,
            adminId: req.user.id,
        });
        res.status(201).json({ success: true, message: 'แยก Report ออกจาก Incident สำเร็จ', data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createIncident,
    getSuggestedIncidentTypes,
    getIncidentTypeCatalog,
    getReportTypeSuggestionCache,
    getPublicMapItems,
    getAdminReviewQueue,
    reviewReportCandidate,
    reviewCandidateGroup,
    createIncidentFromPendingReport,
    rejectStandalonePendingReport,
    separateReportFromIncident,
};
