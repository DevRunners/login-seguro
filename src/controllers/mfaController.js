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

    if (!user) {
      throw new Error('User is not registered')
    }

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

async function validateToken(req, res) {
  const { token, username } = req.body

  try {
    const user = await getUser(username)

    if (!user) {
      throw new Error('User is not registered')
    }

    if (!user.secret) {
      throw new Error('User has not been verified')
    }

    const { base32: secret } = user.secret
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    })

    res.json({ verified })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function isVerified(req, res) {
  const { username } = req.body

  try {
    const user = await getUser(username)

    if (!user) {
      throw new Error('User is not registered')
    }

    res.json({ verified: Boolean(user.secret) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function qrUrl(req, res) {
  const { username } = req.body

  try {
    const user = await getUser(username)

    if (!user) {
      throw new Error('User is not registered')
    }

    if (!user.temp_secret) {
      throw new Error('User has already been verified')
    }

    res.json({ qrUrl: user.temp_secret.otpauth_url })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  addUser,
  verifyToken,
  validateToken,
  isVerified,
  qrUrl,
}