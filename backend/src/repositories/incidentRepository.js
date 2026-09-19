const db = require('../../db/db');
const createIncident = async (incidentData) => {
    const { user_id, category, description, severity = 'medium', images = [], lat, lng } = incidentData;

    const result = await db.query(
        `INSERT INTO tb_incidents (user_id, category, description, severity, images, location)
         VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326))
         RETURNING id, user_id, category, description, severity, images, status, 
                   ST_X(location::geometry) AS lng, 
                   ST_Y(location::geometry) AS lat, 
                   created_at`,
        [user_id, category, description, severity, images, lng, lat]
    );

    return result.rows[0];
};
module.exports = {
    createIncident,
};