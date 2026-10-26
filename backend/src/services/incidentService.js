const incidentRepository = require('../repositories/incidentRepository');
const incidentMediaService = require('./incidentMediaService');
const AppError = require('../utils/AppError');

const isCoordinate = (value, min, max) => Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;

const buildInitialIncidentData = ({ description, lat, lng, selectedType }) => ({
    final_type_id: selectedType?.type_id ?? null,
    title: selectedType ? `${selectedType.type_name} — รอตรวจสอบ` : 'เหตุการณ์รอตรวจสอบ',
    description,
    lat,
    lng,
    display_mode: selectedType?.display_mode ?? 'marker',
    radius_m: selectedType?.display_mode === 'marker' ? null : selectedType?.default_radius_m ?? null,
});

// รับ Report แบบข้อความอิสระ; Type เป็นเพียงคำแนะนำและ Severity ประเมินภายหลัง
const createIncident = async (incidentData) => {
    const {
        description,
        lat,
        lng,
        incident_lat,
        incident_lng,
        incident_source = 'unknown',
        reporter_lat,
        reporter_lng,
        user_selected_type_id,
        media,
    } = incidentData;



    if (!description || !String(description).trim()) {
        throw new AppError('กรุณาระบุว่าเกิดอะไรขึ้น', 400);
    }

    const trimmedDescription = String(description).trim();

    if (trimmedDescription.length < 5) {
        throw new AppError('กรุณาระบุรายละเอียดเหตุการณ์อย่างน้อย 5 ตัวอักษร', 400);
    }

    const incidentLat = incident_lat ?? lat;
    const incidentLng = incident_lng ?? lng;

    if (!isCoordinate(incidentLat, -90, 90) || !isCoordinate(incidentLng, -180, 180)) {
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

    const hasSelectedType = user_selected_type_id !== undefined
        && user_selected_type_id !== null
        && String(user_selected_type_id).trim() !== '';
    const selectedTypeId = hasSelectedType ? Number(user_selected_type_id) : null;
    let selectedType = null;

    if (hasSelectedType) {
        if (!Number.isInteger(selectedTypeId) || selectedTypeId <= 0) {
            throw new AppError('ประเภทเหตุการณ์ที่เลือกไม่ถูกต้อง', 400);
        }

        selectedType = await incidentRepository.findActiveIncidentTypeById(selectedTypeId);
        if (!selectedType) {
            throw new AppError('ประเภทเหตุการณ์ที่เลือกไม่พร้อมใช้งาน', 400);
        }
    }

    // คำแนะนำต้องคำนวณที่ server จาก keyword เสมอ ไม่รับค่าที่ client อ้างว่าเป็นคำแนะนำ
    const [systemSuggestedType] = await getSuggestedIncidentTypes({
        description: trimmedDescription,
        limit: 1,
    });
    // คำแนะนำไม่ใช่ Type จริง แต่หากผู้ใช้เลือก Type ที่สวนทางกับคำแนะนำ ให้ส่งเข้าคิวตรวจแทนการรวมอัตโนมัติ
    const hasTypeConflict = Boolean(
        selectedType
        && systemSuggestedType
        && selectedType.type_id !== systemSuggestedType.type_id,
    );
    const typeStatus = hasTypeConflict ? 'conflict' : selectedType ? 'confirmed' : 'pending';
    const finalTypeId = typeStatus === 'confirmed' ? selectedTypeId : null;
    const mediaFiles = Array.isArray(media) ? media : media ? [media] : [];
    const uploadedMedia = [];

    try {
        for (const file of mediaFiles) {
            uploadedMedia.push(await incidentMediaService.uploadIncidentMedia(file));
        }

        return await incidentRepository.createIncidentReportWithMerge({
            incidentData: buildInitialIncidentData({
                description: trimmedDescription,
                lat: incidentLat,
                lng: incidentLng,
                selectedType: typeStatus === 'confirmed' ? selectedType : null,
            }),
            reportData: {
                ...incidentData,
                description: trimmedDescription,
                lat: incidentLat,
                lng: incidentLng,
                incident_source,
                user_selected_type_id: selectedTypeId,
                system_suggested_type_id: systemSuggestedType?.type_id ?? null,
                // final_type ใช้เฉพาะ Type ที่ไม่ขัดกับคำแนะนำของระบบ; กรณี conflict รอ Administrator ยืนยัน
                final_type_id: finalTypeId,
                type_status: typeStatus,
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

const buildIncidentTypeCatalog = (rows) => {
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
            is_quick: row.is_quick,
            display_mode: row.display_mode,
            default_radius_m: row.default_radius_m,
        });
    }

    return [...categoriesById.values()];
};

const getIncidentTypeCatalog = async () => {
    const rows = await incidentRepository.findActiveIncidentCatalogRows();
    return buildIncidentTypeCatalog(rows);
};

// หน้า Report โหลดเพียงครั้งเดียว แล้วใช้ keywords ใน memory ระหว่างผู้ใช้กำลังพิมพ์
const getReportTypeSuggestionCache = async () => {
    const [catalogRows, keywordRows] = await Promise.all([
        incidentRepository.findActiveIncidentCatalogRows(),
        incidentRepository.findActiveIncidentKeywordRows(),
    ]);

    return {
        categories: buildIncidentTypeCatalog(catalogRows),
        keywords: keywordRows,
    };
};

const getPublicMapItems = async () => incidentRepository.findPublicMapItems();

const reportFalseIncident = async ({ incidentId, userId }) => {
    const normalizedIncidentId = Number(incidentId);
    if (!Number.isInteger(normalizedIncidentId) || normalizedIncidentId <= 0) {
        throw new AppError('รหัสเหตุการณ์ไม่ถูกต้อง', 400);
    }

    const incident = await incidentRepository.findActiveIncidentById(normalizedIncidentId);
    if (!incident) throw new AppError('ไม่พบเหตุการณ์ที่ยังเปิดอยู่', 404);

    const falseReport = await incidentRepository.createFalseIncidentReport({
        incidentId: normalizedIncidentId,
        userId,
    });

    return {
        created: Boolean(falseReport),
        falseReport,
    };
};

const  getIncidentDetail = async (incidentId) => {
    const incidentDetail = await incidentRepository.findPublicIncidentDetailById(
        incidentId,
    );

    if (!incidentDetail) {
        throw new AppError('ไม่พบเหตุการณ์นี้', 404);
    }

    return incidentDetail;
}

const getAdminReviewQueue = async () => incidentRepository.findAdminReviewQueue();

const getAdminSelectedType = async (typeId) => {
    const normalizedTypeId = Number(typeId);
    if (!Number.isInteger(normalizedTypeId) || normalizedTypeId <= 0) {
        throw new AppError('Administrator ต้องเลือก Type ที่ถูกต้อง', 400);
    }

    const selectedType = await incidentRepository.findActiveIncidentTypeById(normalizedTypeId);
    if (!selectedType) throw new AppError('Type ที่เลือกไม่พร้อมใช้งาน', 400);
    return selectedType;
};

const normalizeReviewAction = (action) => {
    if (action === 'accept') return 'accepted';
    if (action === 'reject') return 'rejected';
    throw new AppError('การตัดสิน Candidate ต้องเป็น accept หรือ reject', 400);
};

const reviewReportCandidate = async ({ candidateId, action, adminId }) => {
    try {
        return await incidentRepository.acceptOrRejectReportCandidate({
            candidateId: Number(candidateId),
            adminId,
            action: normalizeReviewAction(action),
        });
    } catch (error) {
        throw new AppError(error.message, 409);
    }
};

const reviewCandidateGroup = async ({ candidateGroupId, action, typeId, targetIncidentId, adminId }) => {
    const normalizedAction = normalizeReviewAction(action);
    const selectedType = normalizedAction === 'accepted' ? await getAdminSelectedType(typeId) : null;

    try {
        return await incidentRepository.acceptOrRejectCandidateGroup({
            candidateGroupId: Number(candidateGroupId),
            adminId,
            action: normalizedAction,
            selectedType,
            targetIncidentId: targetIncidentId ? Number(targetIncidentId) : null,
        });
    } catch (error) {
        throw new AppError(error.message, 409);
    }
};

const createIncidentFromPendingReport = async ({ reportId, typeId, adminId }) => {
    const selectedType = await getAdminSelectedType(typeId);
    try {
        return await incidentRepository.createIncidentFromPendingReport({
            reportId: Number(reportId),
            adminId,
            selectedType,
        });
    } catch (error) {
        throw new AppError(error.message, 409);
    }
};

const rejectStandalonePendingReport = async ({ reportId, adminId }) => {
    try {
        return await incidentRepository.rejectStandalonePendingReport({
            reportId: Number(reportId),
            adminId,
        });
    } catch (error) {
        throw new AppError(error.message, 409);
    }
};

const separateReportFromIncident = async ({ reportId, typeId, adminId }) => {
    const selectedType = await getAdminSelectedType(typeId);
    try {
        return await incidentRepository.separateReportFromIncident({
            reportId: Number(reportId),
            adminId,
            selectedType,
        });
    } catch (error) {
        throw new AppError(error.message, 409);
    }
};

module.exports = {
    createIncident,
    getSuggestedIncidentTypes,
    getIncidentTypeCatalog,
    getReportTypeSuggestionCache,
    getPublicMapItems,
    reportFalseIncident,
    getAdminReviewQueue,
    reviewReportCandidate,
    reviewCandidateGroup,
    createIncidentFromPendingReport,
    rejectStandalonePendingReport,
    separateReportFromIncident,
    getIncidentDetail
};
