const incidentRepository = require('../repositories/incidentRepository');
const AppError = require('../utils/AppError');

const isCoordinate = (value, min, max) => Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;

// รับ Report แบบข้อความอิสระ; Type เป็นเพียงคำแนะนำและ Severity ประเมินภายหลัง
const createIncident = async (incidentData) => {
    const {
        description,
        lat,
        lng,
        reporter_lat,
        reporter_lng,
        user_selected_type_id,
        system_suggested_type_id,
        final_type_id,
        custom_type
    } = incidentData;

    if (!description || !String(description).trim()) {
        throw new AppError('กรุณาระบุว่าเกิดอะไรขึ้น', 400);
    }

    if (!isCoordinate(lat, -90, 90) || !isCoordinate(lng, -180, 180)) {
        throw new AppError('พิกัดจุดเกิดเหตุไม่ถูกต้อง', 400);
    }

    const hasReporterLatitude = reporter_lat !== undefined && reporter_lat !== null;
    const hasReporterLongitude = reporter_lng !== undefined && reporter_lng !== null;

    if (hasReporterLatitude !== hasReporterLongitude) {
        throw new AppError('กรุณาระบุพิกัดผู้รายงานให้ครบทั้งละติจูดและลองจิจูด', 400);
    }

    if (hasReporterLatitude && (!isCoordinate(reporter_lat, -90, 90) || !isCoordinate(reporter_lng, -180, 180))) {
        throw new AppError('พิกัดผู้รายงานไม่ถูกต้อง', 400);
    }

    return incidentRepository.createIncidentReport({
        ...incidentData,
        description: String(description).trim(),
        user_selected_type_id: user_selected_type_id || null,
        system_suggested_type_id: system_suggested_type_id || null,
        final_type_id: final_type_id || user_selected_type_id || null,
        custom_type: custom_type ? String(custom_type).trim() : null
    });
};

module.exports = {
    createIncident
};
