const incidentRepository = require('../repositories/incidentRepository');
const incidentMediaService = require('./incidentMediaService');
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
        custom_type,
        media,
    } = incidentData;



    if (!description || !String(description).trim()) {
        throw new AppError('กรุณาระบุว่าเกิดอะไรขึ้น', 400);
    }

    const trimmedDescription = String(description).trim();

    if (trimmedDescription.length < 5) {
        throw new AppError('กรุณาระบุรายละเอียดเหตุการณ์อย่างน้อย 5 ตัวอักษร', 400);
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

    const selectedTypeId = user_selected_type_id ? Number(user_selected_type_id) : null;
    if (selectedTypeId) {
        const activeTypeIds = await incidentRepository.findActiveIncidentTypeIds([selectedTypeId]);
        if (!activeTypeIds.includes(selectedTypeId)) {
            throw new AppError('ประเภทเหตุการณ์ที่เลือกไม่พร้อมใช้งาน', 400);
        }
    }

    // คำแนะนำต้องคำนวณที่ server จาก keyword เสมอ ไม่รับค่าที่ client อ้างว่าเป็นคำแนะนำ
    const [systemSuggestedType] = await getSuggestedIncidentTypes({
        description: trimmedDescription,
        limit: 1,
    });
    const mediaFiles = Array.isArray(media) ? media : media ? [media] : [];
    const uploadedMedia = [];

    try {
        for (const file of mediaFiles) {
            uploadedMedia.push(await incidentMediaService.uploadIncidentMedia(file));
        }

        return await incidentRepository.createIncidentReportWithMedia({
            reportData: {
                ...incidentData,
                description: String(description).trim(),
                user_selected_type_id: selectedTypeId,
                system_suggested_type_id: systemSuggestedType?.type_id ?? null,
                // final_type เป็นการตัดสินของระบบหรือผู้ดูแลเท่านั้น ไม่รับจาก public request
                final_type_id: selectedTypeId,
                custom_type: custom_type ? String(custom_type).trim() : null,
            },
            media: uploadedMedia,
        });
    } catch (error) {
        for (const uploadedFile of uploadedMedia) {
            try {
                await incidentMediaService.deleteIncidentMedia(uploadedFile);
            } catch (cleanupError) {
                console.error('Unable to remove orphaned incident media from Cloudinary', cleanupError);
            }
        }

        throw error;
    }
};

// Type ที่ได้จากฟังก์ชันนี้เป็นเพียงคำแนะนำ ไม่ได้ยืนยันหรือบังคับให้ผู้ใช้เลือก
const getSuggestedIncidentTypes = async ({ description, limit = 2 }) => {
    const trimmedDescription = String(description || '').trim();

    if (trimmedDescription.length < 2) {
        return [];
    }

    const normalizedLimit = Math.min(Math.max(Number(limit) || 2, 1), 3);

    return incidentRepository.findSuggestedTypes(trimmedDescription, normalizedLimit);
};

const getIncidentTypeCatalog = async () => {
    const rows = await incidentRepository.findActiveIncidentCatalogRows();
    const categoriesById = new Map();

    for (const row of rows) {
        if (!categoriesById.has(row.category_id)) {
            categoriesById.set(row.category_id, {
                category_id: row.category_id,
                category_code: row.category_code,
                category_name: row.category_name,
                icon_name: row.category_icon_name,
                types: [],
            });
        }

        categoriesById.get(row.category_id).types.push({
            type_id: row.type_id,
            type_code: row.type_code,
            type_name: row.type_name,
            icon_name: row.type_icon_name,
            marker_color: row.marker_color,
            display_mode: row.display_mode,
            default_radius_m: row.default_radius_m,
        });
    }

    return [...categoriesById.values()];
};

module.exports = {
    createIncident,
    getSuggestedIncidentTypes,
    getIncidentTypeCatalog,
};
