const express = require('express')
const router = express.Router()
const { createBooth, getAllBooths, getBoothById, updateBooth, deleteBooth, assignBooth } = require('../Controllers/boothController')

router.post('/create', createBooth)
router.get('/getall', getAllBooths)
router.get('/get/:id', getBoothById)
router.put('/update/:id', updateBooth)
router.delete('/delete/:id', deleteBooth)
router.put('/assign/:id', assignBooth)

module.exports = router