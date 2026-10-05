const express = require('express')
const router = express.Router()
const upload = require('../utils/multerConfig')
const { registerExhibitor, getAllExhibitors, getExhibitorById, updateExhibitor, deleteExhibitor, approveExhibitor, rejectExhibitor, searchExhibitors } = require('../Controllers/exhibitorController')

router.post('/register', upload.single('logo'), registerExhibitor)
router.get('/getall', getAllExhibitors)
router.get('/search', searchExhibitors)
router.get('/get/:id', getExhibitorById)
router.put('/update/:id', upload.single('logo'), updateExhibitor)
router.delete('/delete/:id', deleteExhibitor)
router.put('/approve/:id', approveExhibitor)
router.put('/reject/:id', rejectExhibitor)

module.exports = router