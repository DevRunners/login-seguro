const express = require("express")
const { verifyUser, handleSend } = require('../controllers/recaptchaController')

const router = express.Router()

router.post('/verifyUser', verifyUser)
router.post('/send', handleSend)
//router.get('/publicKey', sendPublicKey)

module.exports = router