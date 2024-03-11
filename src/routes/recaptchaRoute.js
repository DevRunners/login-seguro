const express = require("express")
const router = express.Router()
const { verifyUser, handleSend } = require('../controllers/recaptchaController')

router.post('/verifyUser', verifyUser)
router.post('/send', handleSend)

module.exports = router