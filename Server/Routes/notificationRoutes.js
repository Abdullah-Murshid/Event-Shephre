const express = require('express');
const router = express.Router();
const { getUnreadNotifications, markAsRead, sendCustomAlert } = require('../Controllers/notificationController');

router.get('/:userId', getUnreadNotifications);
router.put('/read/:id', markAsRead);
router.post('/alert', sendCustomAlert);

module.exports = router;
