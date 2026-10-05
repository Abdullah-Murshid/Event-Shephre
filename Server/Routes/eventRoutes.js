const express = require('express')
const router = express.Router()
const upload = require('../utils/multerConfig')
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getStats, generateReport} = require('../Controllers/eventController')

router.post('/create', upload.single('banner'), createEvent)
router.get('/getall', getAllEvents)
router.get('/get/:id', getEventById)
router.put('/update/:id', upload.single('banner'), updateEvent)
router.delete('/delete/:id', deleteEvent)
router.get('/stats', getStats)
router.get('/report', generateReport)

module.exports = router 