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
    const result = await db.query('SELECT id, email, password, role FROM tb_users WHERE email = $1', [email]);
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
    updateUser,
    deleteUser
};
