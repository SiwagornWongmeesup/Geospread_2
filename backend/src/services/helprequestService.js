const AppError = require('../utils/AppError');
const helpRequestRepository = require('../repositories/helpRequestRepository');
const db = require('../../db/db')


const createHelpRequestService = async (data, userId) => {
    const {
        help_type,
        custom_help_type,
    } = data

    if (help_type === 'other' && !custom_help_type?.trim()) {
        throw new AppError('กรุณาระบุรายละเอียดประเภทความช่วยเหลือ', 400)
    }


    const payload = {
        ...data,
        user_id: userId,
        custom_help_type: help_type !== 'other' ? null : custom_help_type
    }

    const client = await db.pool.connect()

    try {
        await client.query('BEGIN')
        const helpRequest = await helpRequestRepository.createHelpRequest(payload, client)
        await helpRequestRepository.createHelpRequestUpdate(
            {
                help_request_id: helpRequest.help_request_id,
                user_id: userId,
                message: 'สร้างคำขอความช่วยเหลือ',
                status_after: 'pending'
            },
            client
        )
        await client.query('COMMIT')
        return helpRequest
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
};
const getActiveHelpRequestsService = async () => {
    return helpRequestRepository.getActiveHelpRequests();
}

module.exports = {
    createHelpRequestService,
    getActiveHelpRequestsService,
}


