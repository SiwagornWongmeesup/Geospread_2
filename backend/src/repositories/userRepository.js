// นำเข้าการเชื่อมต่อ Database ของจริงจากโฟลเดอร์ db
const db = require('../../db/db');
//ดึงข้อมูลuser
const getAllUsers = async () => {
    const result = await db.query('SELECT id, email, name, lastname, profile, role, created_at, updated_at FROM tb_users');
    return result.rows; // คืนค่าเฉพาะข้อมูล (rows) กลับไปให้ Service
};
//ดึงข้อมูลuserตามid
const getUserById = async (id) => {
    const result = await db.query('SELECT id, email, name, lastname, profile, role, created_at, updated_at FROM tb_users WHERE id = $1', [id]);
    return result.rows[0];
}
//เช็คemail
const getUserByEmail = async (email) => {
    // ใช้แค่ email ในการค้นหา ($1)
    const result = await db.query('SELECT id, email, password, role, email_verified FROM tb_users WHERE email = $1', [email]);
    return result.rows[0];
}
//สร้างuser
const createUser = async (userData) => {
    const { email, password, name = null, lastname = null, phone = null } = userData;
    const result = await db.query(
        `INSERT INTO tb_users (email, password, name, lastname, phone) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, name, lastname, phone, role, created_at`,
        [email, password, name, lastname, phone]
    );
    return result.rows[0];
};

// สมัครซ้ำด้วยอีเมลที่ยังไม่ยืนยัน: อัปเดตรหัสผ่านและชื่อเป็นค่าล่าสุด (เจ้าของอีเมลจริงต้องยืนยันรหัสอยู่ดี)
const updateUnverifiedUser = async (id, { password, name = null }) => {
    const result = await db.query(
        `UPDATE tb_users SET password = $1, name = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND email_verified = FALSE
         RETURNING id, email, name, role, created_at`,
        [password, name, id]
    );
    return result.rows[0];
};

const markEmailVerified = async (id) => {
    await db.query('UPDATE tb_users SET email_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
};

// ---- รหัส 6 หลักทางอีเมล (ยืนยันอีเมล / รีเซ็ตรหัสผ่าน) ----
// สองตารางมีโครงสร้างเหมือนกัน จึงใช้ฟังก์ชันชุดเดียวกัน (ชื่อตารางมาจากในโค้ดเท่านั้น ไม่ได้มาจากผู้ใช้)
const createCodeStore = (table) => ({
    get: async (userId) => {
        const result = await db.query(
            `SELECT user_id, code_hash, expires_at, attempts, last_sent_at,
                    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_sent_at)) AS seconds_since_sent,
                    expires_at < CURRENT_TIMESTAMP AS is_expired
             FROM ${table} WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    },

    // เขียนทับรหัสเดิม และนับจำนวนครั้งที่ผิดใหม่
    save: async (userId, codeHash, expiresInMinutes) => {
        await db.query(
            `INSERT INTO ${table} (user_id, code_hash, expires_at, attempts, last_sent_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP + make_interval(mins => $3), 0, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id) DO UPDATE
             SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at,
                 attempts = 0, last_sent_at = EXCLUDED.last_sent_at`,
            [userId, codeHash, expiresInMinutes]
        );
    },

    incrementAttempts: async (userId) => {
        const result = await db.query(
            `UPDATE ${table} SET attempts = attempts + 1 WHERE user_id = $1 RETURNING attempts`,
            [userId]
        );
        return result.rows[0]?.attempts ?? 0;
    },

    remove: async (userId) => {
        await db.query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]);
    },
});

const emailVerifications = createCodeStore('tb_email_verifications');
const passwordResets = createCodeStore('tb_password_resets');

// ตั้งรหัสผ่านใหม่ (ลืมรหัสผ่าน) และถือว่าอีเมลยืนยันแล้ว เพราะผู้ใช้พิสูจน์แล้วว่าเปิดอีเมลนี้ได้
const updatePasswordAndVerify = async (id, password) => {
    await db.query(
        'UPDATE tb_users SET password = $1, email_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [password, id]
    );
};

//แก้ไขข้อมูล user
const updateUser = async (id, updateData) => {
    const { name, lastname, profile } = updateData;
    // SQL ต้องการ 4 ตัวแปร ($1, $2, $3, $4) จึงต้องเรียง Array ให้ตรงกันเป๊ะๆ
    const result = await db.query('UPDATE tb_users SET name = $1, lastname = $2, profile = $3 WHERE id = $4 RETURNING id, email, name, lastname',
        [name, lastname, profile, id]
    );
    return result.rows[0];
}

//ลบข้อมูล user
const deleteUser = async (id) => {
    const result = await db.query('DELETE FROM tb_users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
}



module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUnverifiedUser,
    markEmailVerified,
    getEmailVerification: emailVerifications.get,
    saveEmailVerification: emailVerifications.save,
    incrementVerificationAttempts: emailVerifications.incrementAttempts,
    deleteEmailVerification: emailVerifications.remove,
    getPasswordReset: passwordResets.get,
    savePasswordReset: passwordResets.save,
    incrementPasswordResetAttempts: passwordResets.incrementAttempts,
    deletePasswordReset: passwordResets.remove,
    updatePasswordAndVerify,
    updateUser,
    deleteUser
};
