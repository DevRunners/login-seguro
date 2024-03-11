const uuid = require('uuid')
const speakeasy = require('speakeasy')

const {
  getUser,
  addNewUser,
  updateUser,
} = require('../models/userModel')

async function addUser(req, res) {
  const id = uuid.v4()
  const { username, password } = req.body

  try {
    const temp_secret = speakeasy.generateSecret()
    await addNewUser(username, { id, temp_secret, username, password })
    res.json({ id, secret: temp_secret.base32, username, password })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function verifyToken(req, res) {
  const { token, username } = req.body

  try {
    const user = await getUser(username)

    if (!user.temp_secret) {
      throw new Error('User has already been verified')
    }

    const { base32: secret } = user.temp_secret
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    })

    if (verified) {
      updateUser(username, { ...user, secret: user.temp_secret })
    }

    res.json({ verified })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  addUser,
  verifyToken,
}