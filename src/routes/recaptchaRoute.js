const express = require("express")
const { verifyUser, handleSend } = require('../controllers/recaptchaController')

const router = express.Router()

router.post('/verifyUser', verifyUser)
router.post('/send', handleSend)

module.exports = router