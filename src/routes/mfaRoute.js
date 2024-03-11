const express = require('express')
const router = express.Router()
const { addUser, verifyToken } = require('../controllers/mfaController')

router.post('/register', addUser)
router.post('/verifyToken', verifyToken)

module.exports = router