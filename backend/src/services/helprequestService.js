const AppError = require('../utils/AppError');
const helpRequestRepository = require('../repositories/helpRequestRepository');
const incidentMediaService = require('./incidentMediaService');
const db = require('../../db/db')

// โฟลเดอร์รูปของคำขอความช่วยเหลือบน Cloudinary (แยกจากรูปของรายงานเหตุ)
const HELP_MEDIA_FOLDER = 'geospread/help-requests';

// ---------------------------------------------------------------------------
// สร้างคำขอความช่วยเหลือ (พร้อมรูป)
// ---------------------------------------------------------------------------

// อัปโหลดรูปทั้งหมดขึ้น Cloudinary ก่อน แล้วคืนรายการรูปที่อัปโหลดแล้ว
const uploadHelpImages = async (files) => {
    const uploaded = [];
    try {
        for (const file of files) {
            const media = await incidentMediaService.uploadIncidentMedia(file, HELP_MEDIA_FOLDER);
            uploaded.push(media);
        }
        return uploaded;
    } catch (error) {
        // อัปโหลดไม่ครบ: ลบรูปที่ขึ้นไปแล้วทิ้ง จะได้ไม่มีรูปค้างบน Cloudinary
        await deleteUploadedImages(uploaded);
        throw error;
    }
};

const deleteUploadedImages = async (uploadedImages) => {
    for (const media of uploadedImages) {
        try {
            await incidentMediaService.deleteIncidentMedia(media);
        } catch (cleanupError) {
            console.error('ลบรูปคำขอความช่วยเหลือที่อัปโหลดไว้ไม่สำเร็จ', cleanupError);
        }
    }
};

// บันทึกคำขอ + รูป + ประวัติแรก ใน transaction เดียว
const saveHelpRequest = async (payload, uploadedImages, userId) => {
    const client = await db.pool.connect()
    try {
        await client.query('BEGIN')
        const helpRequest = await helpRequestRepository.createHelpRequest(payload, client)

        for (const media of uploadedImages) {
            await helpRequestRepository.createHelpRequestMedia({
                helpRequestId: helpRequest.help_request_id,
                mediaType: media.media_type,
                mediaUrl: media.media_url,
            }, client)
        }

        await helpRequestRepository.createHelpRequestUpdate({
            help_request_id: helpRequest.help_request_id,
            user_id: userId,
            message: 'สร้างคำขอความช่วยเหลือ',
            status_after: 'pending'
        }, client)

        await client.query('COMMIT')
        return helpRequest
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
};

const createHelpRequestService = async (data, userId, files = []) => {
    const { help_type, custom_help_type } = data

    if (help_type === 'other' && !custom_help_type?.trim()) {
        throw new AppError('กรุณาระบุรายละเอียดประเภทความช่วยเหลือ', 400)
    }

    let customHelpType = null
    if (help_type === 'other') {
        customHelpType = custom_help_type.trim()
    }
    const payload = { ...data, user_id: userId, custom_help_type: customHelpType }

    const uploadedImages = await uploadHelpImages(files)
    try {
        return await saveHelpRequest(payload, uploadedImages, userId)
    } catch (err) {
        // บันทึกฐานข้อมูลไม่สำเร็จ: ลบรูปที่อัปโหลดไปแล้ว
        await deleteUploadedImages(uploadedImages)
        throw err
    }
};

const getActiveHelpRequestsService = async () => {
    return helpRequestRepository.getActiveHelpRequests();
}

// คำขอของฉัน + คำขอที่ฉันเสนอช่วย (การ์ด "ความช่วยเหลือของฉัน" ในหน้าโปรไฟล์)
const getMyHelpService = async (userId) => {
    const requested = await helpRequestRepository.getHelpRequestsByOwner(userId);
    const offered = await helpRequestRepository.getOffersByHelper(userId);
    return { requested, offered };
};

// ---------------------------------------------------------------------------
// รายละเอียดคำขอ (ข้อมูลที่ได้เห็นขึ้นกับว่าใครเปิดดู)
// ---------------------------------------------------------------------------

// คำขอยังรับข้อเสนอได้ไหม: ต้องยังรอความช่วยเหลือและยังไม่หมดอายุ
const isOpenForOffers = (request) => {
    if (request.request_status !== 'pending') {
        return false;
    }
    if (request.is_expired) {
        return false;
    }
    return true;
};

// สิทธิ์ของคนที่เปิดดู: เป็นเจ้าของไหม, เคยเสนอไหม, เป็นผู้ช่วยที่ได้รับอนุมัติไหม
const getViewerInfo = async (request, viewerId) => {
    if (!viewerId) {
        return {
            is_logged_in: false,
            is_owner: false,
            is_accepted_helper: false,
            my_offer: null,
            can_offer: false,
            can_report_requester: false,
            my_contact: null,
        };
    }

    const isOwner = request.user_id === viewerId;
    const isAcceptedHelper = request.request_status === 'accepted' && request.accepted_by === viewerId;

    let myOffer = null;
    if (!isOwner) {
        myOffer = await helpRequestRepository.findOfferByHelper({
            helpRequestId: request.help_request_id,
            helperId: viewerId,
        }) ?? null;
    }

    let canOffer = false;
    if (!isOwner && !myOffer && isOpenForOffers(request)) {
        canOffer = true;
    }

    // รายงานผู้ขอได้ เฉพาะคนที่เคยเสนอช่วยคำขอนี้ และยังไม่เคยรายงาน
    let canReportRequester = false;
    if (myOffer && request.user_id) {
        const reportedIds = await helpRequestRepository.getReportedUserIds({
            reporterId: viewerId,
            helpRequestId: request.help_request_id,
        });
        canReportRequester = !reportedIds.includes(request.user_id);
    }

    // โปรไฟล์ของคนดูมีเบอร์ / LINE ไหม
    // - เจ้าของ: ใช้เปิดช่องติ๊กตอนกดรับข้อเสนอ
    // - ผู้ช่วย: เตือนว่าถ้าไม่มี ผู้ขอจะติดต่อกลับไม่ได้
    let myContact;
    if (isOwner) {
        myContact = {
            has_phone: Boolean(request.requester_phone),
            has_line: Boolean(request.requester_line_id),
        };
    } else {
        myContact = await helpRequestRepository.getUserContactFlags(viewerId);
    }

    return {
        is_logged_in: true,
        is_owner: isOwner,
        is_accepted_helper: isAcceptedHelper,
        my_offer: myOffer,
        can_offer: canOffer,
        can_report_requester: canReportRequester,
        my_contact: myContact,
    };
};

// ช่องทางติดต่อของผู้ขอที่ผู้ช่วยที่ได้รับเลือกจะเห็น: เฉพาะช่องที่ผู้ขอเลือกแชร์
const getRequesterContact = (request) => {
    let phone = null;
    if (request.share_phone) {
        phone = request.requester_phone;
    }
    let lineId = null;
    if (request.share_line) {
        lineId = request.requester_line_id;
    }
    return { name: request.requester_name, phone, line_id: lineId };
};

// ข้อเสนอที่เจ้าของเห็น: ช่องทางติดต่อของผู้ช่วยให้เห็นเฉพาะคนที่รับแล้ว
const toOwnerOfferView = (offer, reportedIds) => {
    const { helper_id, helper_phone, helper_line_id, ...rest } = offer;
    let contact = null;
    if (offer.offer_status === 'accepted') {
        contact = { phone: helper_phone, line_id: helper_line_id };
    }
    // ก่อนรับ บอกแค่ว่าผู้ช่วยมีช่องทางติดต่อไหม (ยังไม่เปิดเผยค่าจริง)
    const hasContact = Boolean(helper_phone || helper_line_id);
    return { ...rest, contact, has_contact: hasContact, is_reported: reportedIds.includes(helper_id) };
};

const getHelpRequestDetailService = async (helpRequestId, viewerId = null) => {
    const request = await helpRequestRepository.getHelpRequestById(helpRequestId);
    if (!request) {
        throw new AppError('ไม่พบคำขอความช่วยเหลือนี้', 404);
    }

    const media = await helpRequestRepository.getHelpRequestMedia(helpRequestId);
    const viewer = await getViewerInfo(request, viewerId);

    // เจ้าของเห็นรายการข้อเสนอทั้งหมด คนอื่นเห็นแค่จำนวน
    let offers = null;
    if (viewer.is_owner) {
        const allOffers = await helpRequestRepository.getOffersForRequest(helpRequestId);
        const reportedIds = await helpRequestRepository.getReportedUserIds({ reporterId: viewerId, helpRequestId });
        offers = allOffers.map((offer) => toOwnerOfferView(offer, reportedIds));
    }

    // ช่องทางติดต่อของผู้ขอ: เฉพาะผู้ช่วยที่ได้รับเลือก
    let contact = null;
    if (viewer.is_accepted_helper) {
        contact = getRequesterContact(request);
    }

    // พิกัดจริงเห็นเฉพาะเจ้าของและผู้ช่วยที่ได้รับเลือก คนอื่นเห็นตำแหน่งคร่าวๆ (~500 ม.)
    let lat = request.approx_lat;
    let lng = request.approx_lng;
    let locationIsApproximate = true;
    if (viewer.is_owner || viewer.is_accepted_helper) {
        lat = request.lat;
        lng = request.lng;
        locationIsApproximate = false;
    }

    // ไม่ส่ง user_id, accepted_by, พิกัดคร่าว/จริงที่ไม่ได้เลือก และข้อมูลติดต่อดิบออกไป
    const {
        user_id, accepted_by, requester_phone, requester_line_id,
        approx_lat, approx_lng, lat: exactLat, lng: exactLng,
        ...publicFields
    } = request;

    return {
        ...publicFields,
        lat,
        lng,
        location_is_approximate: locationIsApproximate,
        media,
        offers,
        contact,
        viewer,
    };
};

// ---------------------------------------------------------------------------
// เสนอช่วยเหลือ
// ---------------------------------------------------------------------------

const createOfferService = async (helpRequestId, helperId, message) => {
    const request = await helpRequestRepository.getHelpRequestById(helpRequestId);
    if (!request) {
        throw new AppError('ไม่พบคำขอความช่วยเหลือนี้', 404);
    }
    if (request.user_id === helperId) {
        throw new AppError('เสนอช่วยคำขอของตัวเองไม่ได้', 400);
    }
    if (!isOpenForOffers(request)) {
        throw new AppError('คำขอนี้ไม่รับข้อเสนอแล้ว', 409);
    }

    const existingOffer = await helpRequestRepository.findOfferByHelper({ helpRequestId, helperId });
    if (existingOffer) {
        throw new AppError('คุณเสนอช่วยคำขอนี้ไปแล้ว', 409);
    }

    let cleanMessage = null;
    if (message && message.trim()) {
        cleanMessage = message.trim();
    }

    try {
        return await saveOffer({ helpRequestId, helperId, message: cleanMessage });
    } catch (err) {
        // กดเสนอพร้อมกันสองครั้ง: ฐานข้อมูลกันซ้ำไว้ (unique) ตอบเหมือนเสนอซ้ำ
        if (err.code === '23505') {
            throw new AppError('คุณเสนอช่วยคำขอนี้ไปแล้ว', 409);
        }
        throw err;
    }
};

const saveOffer = async ({ helpRequestId, helperId, message }) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const offer = await helpRequestRepository.createOffer({ helpRequestId, helperId, message }, client);
        await helpRequestRepository.createHelpRequestUpdate({
            help_request_id: helpRequestId,
            user_id: helperId,
            message: 'มีผู้เสนอช่วยเหลือ',
            status_after: 'pending',
        }, client);
        await client.query('COMMIT');
        return offer;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ---------------------------------------------------------------------------
// ตอบข้อเสนอ: เจ้าของ รับ / ปฏิเสธ, ผู้ช่วย ถอนตัว
// ---------------------------------------------------------------------------

// เปิด transaction + ล็อกแถวคำขอ แล้วเรียก work(client, request)
// กันสองคนกดเปลี่ยนสถานะคำขอเดียวกันพร้อมกัน
const withLockedRequest = async (helpRequestId, work) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const request = await helpRequestRepository.lockHelpRequest(helpRequestId, client);
        if (!request) {
            throw new AppError('ไม่พบคำขอความช่วยเหลือนี้', 404);
        }
        await work(client, request);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const logStatusChange = async ({ helpRequestId, userId, message, statusAfter }, client) => {
    await helpRequestRepository.createHelpRequestUpdate({
        help_request_id: helpRequestId,
        user_id: userId,
        message,
        status_after: statusAfter,
    }, client);
};

// ตรวจช่องทางที่ผู้ขอเลือกแชร์ตอนรับข้อเสนอ
// - เลือกได้เฉพาะช่องที่มีในโปรไฟล์
// - ผู้ขอมีช่องทางติดต่อ: ต้องแชร์อย่างน้อย 1 ช่อง
// - ผู้ขอไม่มีเลย: รับได้ ถ้าผู้ช่วยมีช่องทางติดต่อ (ผู้ขอจะเห็นแล้วติดต่อไปเอง)
// - ไม่มีทั้งสองฝ่าย: รับไม่ได้ เพราะจะติดต่อกันไม่ได้เลย
const checkShareChoice = async ({ helpRequestId, helperId, sharePhone, shareLine }, client) => {
    const detail = await helpRequestRepository.getHelpRequestById(helpRequestId, client);
    if (sharePhone && !detail.requester_phone) {
        throw new AppError('ยังไม่มีเบอร์โทรในโปรไฟล์ของคุณ', 400);
    }
    if (shareLine && !detail.requester_line_id) {
        throw new AppError('ยังไม่มี LINE ID ในโปรไฟล์ของคุณ', 400);
    }

    const ownerHasContact = Boolean(detail.requester_phone || detail.requester_line_id);
    if (ownerHasContact) {
        if (!sharePhone && !shareLine) {
            throw new AppError('กรุณาเลือกช่องทางติดต่ออย่างน้อย 1 ช่องทาง', 400);
        }
        return;
    }

    const helperContact = await helpRequestRepository.getUserContactFlags(helperId, client);
    if (!helperContact.has_phone && !helperContact.has_line) {
        throw new AppError('ทั้งคุณและผู้ช่วยยังไม่มีเบอร์โทรหรือ LINE ในโปรไฟล์ เพิ่มในโปรไฟล์ของคุณก่อนจึงจะรับข้อเสนอได้', 400);
    }
};

// รับข้อเสนอ: ข้อเสนอนี้ → accepted, ข้อเสนออื่นที่รออยู่ → declined, คำขอ → accepted
const acceptOffer = async ({ request, offer, userId, sharePhone, shareLine }, client) => {
    if (!isOpenForOffers(request)) {
        throw new AppError('คำขอนี้ไม่รับข้อเสนอแล้ว', 409);
    }
    await checkShareChoice({
        helpRequestId: request.help_request_id,
        helperId: offer.helper_id,
        sharePhone,
        shareLine,
    }, client);

    await helpRequestRepository.updateOfferStatus({ offerId: offer.offer_id, offerStatus: 'accepted' }, client);
    await helpRequestRepository.declineOtherPendingOffers({
        helpRequestId: request.help_request_id,
        acceptedOfferId: offer.offer_id,
    }, client);
    await helpRequestRepository.markHelpRequestAccepted({
        helpRequestId: request.help_request_id,
        helperId: offer.helper_id,
        sharePhone,
        shareLine,
    }, client);
    await logStatusChange({
        helpRequestId: request.help_request_id,
        userId,
        message: 'ผู้ขอรับข้อเสนอความช่วยเหลือแล้ว',
        statusAfter: 'accepted',
    }, client);
};

// ผู้ช่วยถอนตัว: ถ้ายังรอ → withdrawn เฉยๆ, ถ้าได้รับเลือกแล้ว → คำขอกลับไปรอความช่วยเหลือใหม่
const withdrawOffer = async ({ request, offer, userId }, client) => {
    if (offer.offer_status !== 'pending' && offer.offer_status !== 'accepted') {
        throw new AppError('ข้อเสนอนี้ถอนไม่ได้แล้ว', 409);
    }
    const wasAccepted = offer.offer_status === 'accepted';
    await helpRequestRepository.updateOfferStatus({ offerId: offer.offer_id, offerStatus: 'withdrawn' }, client);

    if (wasAccepted && request.request_status === 'accepted') {
        await helpRequestRepository.reopenHelpRequest(request.help_request_id, client);
        await logStatusChange({
            helpRequestId: request.help_request_id,
            userId,
            message: 'ผู้ช่วยถอนตัว คำขอกลับไปรอความช่วยเหลือ',
            statusAfter: 'pending',
        }, client);
    }
};

const respondToOfferService = async ({ helpRequestId, offerId, userId, action, sharePhone = false, shareLine = false }) => {
    await withLockedRequest(helpRequestId, async (client, request) => {
        const offer = await helpRequestRepository.findOfferById({ helpRequestId, offerId }, client);
        if (!offer) {
            throw new AppError('ไม่พบข้อเสนอนี้', 404);
        }

        // ถอนตัว: ทำได้เฉพาะเจ้าของข้อเสนอ
        if (action === 'withdraw') {
            if (offer.helper_id !== userId) {
                throw new AppError('ถอนได้เฉพาะข้อเสนอของตัวเอง', 403);
            }
            await withdrawOffer({ request, offer, userId }, client);
            return;
        }

        // รับ / ปฏิเสธ: ทำได้เฉพาะเจ้าของคำขอ และข้อเสนอต้องยังรออยู่
        if (request.user_id !== userId) {
            throw new AppError('เฉพาะเจ้าของคำขอเท่านั้นที่ตอบข้อเสนอได้', 403);
        }
        if (offer.offer_status !== 'pending') {
            throw new AppError('ตอบข้อเสนอนี้ไปแล้ว', 409);
        }

        if (action === 'accept') {
            await acceptOffer({ request, offer, userId, sharePhone, shareLine }, client);
        } else {
            await helpRequestRepository.updateOfferStatus({ offerId, offerStatus: 'declined' }, client);
        }
    });

    // ส่งรายละเอียดล่าสุดกลับไป หน้าเว็บจะได้แสดงผลใหม่ได้ทันที
    return getHelpRequestDetailService(helpRequestId, userId);
};

// ---------------------------------------------------------------------------
// เจ้าของเปลี่ยนสถานะคำขอ: ได้รับความช่วยเหลือแล้ว / ยกเลิก / ปลดผู้ช่วย
// ---------------------------------------------------------------------------

// ได้รับความช่วยเหลือแล้ว: ต้องมีผู้ช่วยที่รับไว้ก่อน
const resolveRequest = async ({ request, userId }, client) => {
    if (request.request_status !== 'accepted') {
        throw new AppError('ปิดคำขอได้หลังจากรับข้อเสนอแล้วเท่านั้น', 409);
    }
    await helpRequestRepository.markHelpRequestResolved(request.help_request_id, client);
    await logStatusChange({
        helpRequestId: request.help_request_id,
        userId,
        message: 'ผู้ขอได้รับความช่วยเหลือแล้ว',
        statusAfter: 'resolved',
    }, client);
};

// ยกเลิกคำขอ: ได้ทั้งตอนรอ และตอนมีผู้ช่วยแล้ว ข้อเสนอที่ยังรอจะถูกปฏิเสธทั้งหมด
const cancelRequest = async ({ request, userId }, client) => {
    if (request.request_status !== 'pending' && request.request_status !== 'accepted') {
        throw new AppError('คำขอนี้ปิดไปแล้ว', 409);
    }
    await helpRequestRepository.declineOtherPendingOffers({
        helpRequestId: request.help_request_id,
        acceptedOfferId: 0,
    }, client);
    await helpRequestRepository.markHelpRequestCancelled(request.help_request_id, client);
    await logStatusChange({
        helpRequestId: request.help_request_id,
        userId,
        message: 'ผู้ขอยกเลิกคำขอ',
        statusAfter: 'cancelled',
    }, client);
};

// ปลดผู้ช่วย (เช่น ผู้ช่วยไม่มา): ข้อเสนอนั้น → released, คำขอกลับไปรอความช่วยเหลือ
const releaseHelper = async ({ request, userId }, client) => {
    if (request.request_status !== 'accepted') {
        throw new AppError('คำขอนี้ยังไม่มีผู้ช่วย', 409);
    }
    const acceptedOffer = await helpRequestRepository.findAcceptedOffer(request.help_request_id, client);
    if (acceptedOffer) {
        await helpRequestRepository.updateOfferStatus({ offerId: acceptedOffer.offer_id, offerStatus: 'released' }, client);
    }
    await helpRequestRepository.reopenHelpRequest(request.help_request_id, client);
    await logStatusChange({
        helpRequestId: request.help_request_id,
        userId,
        message: 'ผู้ขอเปลี่ยนผู้ช่วย คำขอกลับไปรอความช่วยเหลือ',
        statusAfter: 'pending',
    }, client);
};

const updateRequestStatusService = async ({ helpRequestId, userId, action }) => {
    await withLockedRequest(helpRequestId, async (client, request) => {
        if (request.user_id !== userId) {
            throw new AppError('เฉพาะเจ้าของคำขอเท่านั้นที่เปลี่ยนสถานะได้', 403);
        }

        if (action === 'resolve') {
            await resolveRequest({ request, userId }, client);
        } else if (action === 'cancel') {
            await cancelRequest({ request, userId }, client);
        } else {
            await releaseHelper({ request, userId }, client);
        }
    });

    return getHelpRequestDetailService(helpRequestId, userId);
};

// ---------------------------------------------------------------------------
// รายงานผู้ใช้ที่น่าสงสัย
// ---------------------------------------------------------------------------

// หาว่ากำลังรายงานใคร:
// - ส่ง offerId มา = เจ้าของคำขอรายงานผู้ช่วยที่เสนอมา
// - ไม่ส่ง = ผู้ที่เคยเสนอช่วยรายงานผู้ขอ
const findReportedUserId = async ({ request, reporterId, offerId }) => {
    if (offerId) {
        if (request.user_id !== reporterId) {
            throw new AppError('รายงานผู้ช่วยได้เฉพาะเจ้าของคำขอ', 403);
        }
        const offer = await helpRequestRepository.findOfferById({ helpRequestId: request.help_request_id, offerId });
        if (!offer) {
            throw new AppError('ไม่พบข้อเสนอนี้', 404);
        }
        return offer.helper_id;
    }

    const myOffer = await helpRequestRepository.findOfferByHelper({
        helpRequestId: request.help_request_id,
        helperId: reporterId,
    });
    if (!myOffer) {
        throw new AppError('รายงานผู้ขอได้เฉพาะคนที่เคยเสนอช่วยคำขอนี้', 403);
    }
    if (!request.user_id) {
        throw new AppError('ไม่พบผู้ขอของคำขอนี้', 404);
    }
    return request.user_id;
};

const createUserReportService = async ({ helpRequestId, reporterId, offerId, reason, details }) => {
    const request = await helpRequestRepository.getHelpRequestById(helpRequestId);
    if (!request) {
        throw new AppError('ไม่พบคำขอความช่วยเหลือนี้', 404);
    }

    const reportedUserId = await findReportedUserId({ request, reporterId, offerId });

    let cleanDetails = null;
    if (details && details.trim()) {
        cleanDetails = details.trim();
    }

    try {
        return await helpRequestRepository.createUserReport({
            reporterId,
            reportedUserId,
            helpRequestId,
            reason,
            details: cleanDetails,
        });
    } catch (err) {
        if (err.code === '23505') {
            throw new AppError('คุณรายงานผู้ใช้นี้ในคำขอนี้ไปแล้ว', 409);
        }
        throw err;
    }
};

module.exports = {
    createHelpRequestService,
    getActiveHelpRequestsService,
    getMyHelpService,
    getHelpRequestDetailService,
    createOfferService,
    respondToOfferService,
    updateRequestStatusService,
    createUserReportService,
}
