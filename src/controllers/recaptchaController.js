const fetch = require('isomorphic-fetch')
const { JsonDB, Config } = require('node-json-db')
const db = new JsonDB(new Config('users', true, true, '/'))

module.exports = {
  handleSend: (req, res) => {
    const secret_key = process.env.SECRET_KEY
    const token = req.body.token
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`

    fetch(url, {
      method: 'post'
    })
      .then(response => response.json())
      .then(google_response => res.json({ google_response }))
      .catch(error => res.json({ error }))
  },
  verifyUser: async (req, res) => {
    const path = `/user/${req.body.username}`
    try {
      const user = await db.getData(path)
      if (user.password === req.body.password) {
        res.json({ message: 'verified', url: user.secret?.otpauth_url || user.temp_secret.otpauth_url, username: user.username})
      } else {
        res.json({ message: 'not verified' })
      }
    } catch (error) {
      res.json({ message: "can't find the user" })
    }
  }
}
