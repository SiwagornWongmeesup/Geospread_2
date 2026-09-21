const incidentService = require('../services/incidentService');

const createIncident = async (req, res, next) => {
    try {
        const incidentData = {
            ...req.body,
            user_id: req.user.id
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
module.exports = {
    createIncident,
};
