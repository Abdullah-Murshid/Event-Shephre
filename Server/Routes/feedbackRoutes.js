const express = require('express')
const router = express.Router()
const { createFeedback, getAllFeedback, getFeedbackById, deleteFeedback } = require('../Controllers/feedbackController')

router.post('/create', createFeedback)
router.get('/getall', getAllFeedback)
router.get('/get/:id', getFeedbackById)
router.delete('/delete/:id', deleteFeedback)

module.exports = router