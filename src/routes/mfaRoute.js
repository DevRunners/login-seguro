const express = require('express')
const { addUser,
  verifyToken,
  validateToken,
  isVerified,
  qrUrl,
  changeSession
} = require('../controllers/mfaController')

const router = express.Router()

router.post('/register', addUser)
router.post('/verifyToken', verifyToken)
router.post('/validateToken', validateToken)
router.post('/isVerified', isVerified)
router.post('/qrUrl', qrUrl)
router.post('/changeSession', changeSession)

module.exports = router