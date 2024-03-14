const uuid = require('uuid')
const speakeasy = require('speakeasy')
const bcrypt = require('bcrypt')
const {
  getUser,
  addNewUser,
  updateUser,
} = require('../models/userModel')

async function addUser(req, res) {
  const id = uuid.v4()
  const { username, password } = req.body
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  try {
    const temp_secret = speakeasy.generateSecret()
    await addNewUser(username, { id, temp_secret, username, password: hashedPassword, session: false})

    res.status(200).json({ message: `Usuario ${username} registrado con éxito` })
  } catch (err) {
    res.status(500).json({ message: 'El usuario no se ha podido registrar' })
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

    res.status(200).json({ verified })
  } catch (err) {
    res.status(500).json({ message: "Falló la verificación del token" })
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

    res.status(200).json({ verified })
  } catch (err) {
    res.status(500).json({ message: "Fallo la validación del token" })
  }
}

async function isVerified(req, res) {
  const { username } = req.body

  try {
    const user = await getUser(username)

    res.status(200).json({ verified: Boolean(user.secret) })
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado"})
  }
}

async function qrUrl(req, res) {
  const { username } = req.body

  try {
    const user = await getUser(username)

    if (!user.temp_secret) {
      throw new Error('User has already been verified')
    }

    res.status(200).json({ qrUrl: user.temp_secret.otpauth_url })
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado" })
  }
}

async function changeSession(req, res) {
  const { username } = req.body

  try {
    const user = await getUser(username)

    if (!user) {
      throw new Error('User is not registered')
    }

    const updatedUser = await updateUser(username, { ...user, session: !user.session })

    res.status(200).json({ message: `Sesión de usuario ${username} actualizada` })
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado" })
  }
}

module.exports = {
  addUser,
  verifyToken,
  validateToken,
  isVerified,
  qrUrl,
  changeSession
}