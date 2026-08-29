const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route: GET /users
// หน้าที่: ดึงข้อมูลผู้ใช้งานทั้งหมด
router.get('/', userController.getAllUsers);

// Route: GET /users/:id
// หน้าที่: ดึงข้อมูลผู้ใช้งานตาม ID
// const { getUserByIdValidator } = require('../validators/userValidator');
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser)

module.exports = router;
