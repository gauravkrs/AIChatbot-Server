const express = require('express');
const { askQuery, getHistory, clearHistory } = require('../controller/chatController');

const router = express.Router();

router.post('/ask', askQuery);
router.get('/history/:sessionId', getHistory);
router.post('/history/:sessionId', clearHistory)

module.exports = router;