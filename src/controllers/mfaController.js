const uuid = require('uuid')
const speakeasy = require('speakeasy')
const { JsonDB, Config } = require('node-json-db')
const db = new JsonDB(new Config('users', true, true, '/'))

module.exports = {
  addUser: (req, res) => {
    const id = uuid.v4()
    let username = req.body.username
    let password = req.body.password

    try {
      const path = `/user/${username}`
      const temp_secret = speakeasy.generateSecret()
      db.push(path, { id, temp_secret, username, password })
      res.json({ id, secret: temp_secret.base32, username, password })
    } catch (error) {
      res.status(500).json({ message: 'Error generating the secret' })
    }
  },
  verifyToken: async (req, res) => {
    const { token, username } = req.body
    const path = `/user/${username}`

    try {
      const user = await db.getData(path)
      const { base32: secret } = user.temp_secret || user.secret
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
      })
      if (verified) {
        db.push(path, { ...user, secret: user.temp_secret || user.secret })
        res.json({ verified: true })
      } else {
        res.json({ verified: false })
      }
    } catch (error) {
      res.status(500).json({ message: 'Error finding the user' })
    }
  }
}