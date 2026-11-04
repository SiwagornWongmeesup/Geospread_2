const { Pool } = require('pg');

// ฐานข้อมูลในเครื่อง (localhost) ไม่ต้องใช้ SSL
// ฐานข้อมูลบนคลาวด์ (เช่น Supabase) ต้องใช้ SSL เพื่อเข้ารหัสข้อมูลที่ส่งระหว่าง backend กับ db
const buildConfig = (rawUrl) => {
    if (!rawUrl) return {};

    const url = new URL(rawUrl);
    const isLocal = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname);
    if (isLocal) return { connectionString: rawUrl };

    // ลบ sslmode ออกจาก URL เพราะ pg จะเอาค่าใน URL มาทับการตั้งค่า ssl ด้านล่าง
    url.searchParams.delete('sslmode');
    return {
        connectionString: url.toString(),
        // เข้ารหัสด้วย SSL แต่ไม่ตรวจใบรับรอง เพราะใบรับรองของ Supabase pooler เป็นแบบ self-signed
        ssl: { rejectUnauthorized: false },
    };
};

const pool = new Pool(buildConfig(process.env.DATABASE_URL));

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
