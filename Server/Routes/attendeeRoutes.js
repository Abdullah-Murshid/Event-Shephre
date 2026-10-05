const express = require('express')
const router = express.Router()
const { registerAttendee, getAllAttendees, getAttendeeById, addSession, addBookmark, deleteAttendee, getNotifications, getBookmarks, createBookmark, removeBookmark, toggleSessionBookmark } = require('../Controllers/attendeeController')

router.post('/register', registerAttendee)
router.get('/getall', getAllAttendees)
router.get('/get/:id', getAttendeeById)
router.get('/notifications/:userId', getNotifications)
router.get('/bookmarks/:userId', getBookmarks)
router.post('/bookmarks', createBookmark)
router.delete('/bookmarks/:userId/:eventId', removeBookmark)
router.put('/addsession/:id', addSession)
router.put('/addbookmark/:id', addBookmark)
router.post('/session-bookmark', toggleSessionBookmark)
router.delete('/delete/:id', deleteAttendee)

module.exports = router