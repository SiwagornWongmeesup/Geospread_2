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

module.exports = {
    createIncident,
    getSuggestedIncidentTypes,
    getIncidentTypeCatalog,
};
