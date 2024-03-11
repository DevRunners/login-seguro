require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('isomorphic-fetch')
const { Users } = require('./db/users')

const app = express()
const port = process.env.PORT || 3000

app.use(express.static('public'))
app.use(bodyParser.json())

const handleSend = (req, res) => {
  const secret_key = process.env.SECRET_KEY
  const token = req.body.token
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`

  fetch(url, {
    method: 'post'
  })
    .then(response => response.json())
    .then(google_response => res.json({ google_response }))
    .catch(error => res.json({ error }))
}

const verifyUser = (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const users = new Users()
  const user = users.getUserByUsername(username)

  if (user && user.getPassword === password) {
    res.json({ message: 'User verified' })
  } else {
    res.json({ message: 'User not verified' })
  }
}

app.post('/verifyUser', verifyUser)
app.post('/send', handleSend);
app.post('/totp')

app.listen(port, () => console.log(`Listening on port ${port}`))