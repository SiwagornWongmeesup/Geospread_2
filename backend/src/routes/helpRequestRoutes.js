const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createHelpRequestValidator,
} = require('../validators/helpRequestValidator');

router.post('/',
    authMiddleware,
    createHelpRequestValidator,
    helpRequestController.createHelpRequest);

router.get('/map',
    helpRequestController.getActiveHelpRequests);

module.exports = router;
