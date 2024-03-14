const express = require('express')
require('dotenv').config()

const mfaRoute = require('./src/routes/mfaRoute')
const recaptchaRoute = require('./src/routes/recaptchaRoute')
const { setEnvVariables } = require('./src/encrypt')

setEnvVariables()

const app = express()
const port = process.env.PORT || 3000

app.use(express.static('public'))
app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'")
  res.setHeader('Referrer-Policy', 'origin-when-cross-origin')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
  res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'; camera 'none'")
  res.setHeader('Server', '')
  res.setHeader('X-Powered-By', '')
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  next()
})

app.use('/api', mfaRoute)
app.use('/api', recaptchaRoute)


app.listen(port, () => console.log(`Listening on port ${port}`))