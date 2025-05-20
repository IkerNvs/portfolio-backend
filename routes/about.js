const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const authMiddleware = require('../utils/authMiddleware');

// Nueva API con bloques
router.get('/blocks', aboutController.getAbout);
router.post('/blocks', authMiddleware, aboutController.saveAboutBlocks);

module.exports = router;
