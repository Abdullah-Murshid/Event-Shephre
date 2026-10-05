const express = require('express')
const router = express.Router()
const { updateUser, deleteUser, getAllUsers } = require('../Controllers/userController')

router.put('/update/:id', updateUser)
router.delete('/delete/:id', deleteUser)
router.get('/getall', getAllUsers)

module.exports = router