const fetch = require('isomorphic-fetch')
const bcrypt = require('bcrypt')
const { getUser } = require('../models/userModel')
const { decryptedPassword } = require('../encrypt')

async function handleSend(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY
  const { token } = req.body
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`

  try {
    const response = await fetch(url, { method: 'post' })
    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify token' })
  }
}

async function verifyUser(req, res) {
  const { username, password } = req.body

  console.log(password)

  let plainTextPassword = await decryptedPassword(password)
  console.log(plainTextPassword)

  try {
    const user = await getUser(username)
    const match = await bcrypt.compare(plainTextPassword, user.password)
    if (match) {
      res.status(200).json({ message: 'verified', username: user.username })
    } else {
      res.status(200).json({ message: "not verified" })
    }
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado" })
  }
}

async function sendPublicKey(req, res) {
  res.status(200).json({ publicKey: process.env.PUBLIC_KEY })
}

module.exports = {
  handleSend,
  verifyUser,
  sendPublicKey
}
