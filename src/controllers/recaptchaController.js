const fetch = require('isomorphic-fetch')
const { getUser } = require('../models/userModel')

async function handleSend(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY
  const { token } = req.body
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`

  try {
    const response = await fetch(url, { method: 'post' })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.json(err)
  }
}

async function verifyUser(req, res) {
  const { username, password } = req.body

  try {
    const user = await getUser(username)

    if (!user) {
      throw new Error('User is not registered')
    }

    if (user.password === password) {
      res.json({ message: 'verified', username: user.username })
    } else {
      res.json({ message: 'not verified' })
    }
  } catch (err) {
    res.json({ message: err.message })
  }
}

module.exports = {
  handleSend,
  verifyUser,
}
