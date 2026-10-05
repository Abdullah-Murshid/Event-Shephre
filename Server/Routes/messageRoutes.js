const express = require('express')
const router = express.Router()
const { sendMessage, getConversations, getMessageThread, getUnreadCount, markAllAsRead } = require('../Controllers/messageController')

router.post('/send', sendMessage)
router.get('/conversations/:userId', getConversations)
router.get('/thread/:userId/:partnerId', getMessageThread)
router.get('/unread/:userId', getUnreadCount)
router.put('/markread/:userId', markAllAsRead)

module.exports = router