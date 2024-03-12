const express = require('express')
require('dotenv').config()

const mfaRoute = require('./src/routes/mfaRoute')
const recaptchaRoute = require('./src/routes/recaptchaRoute')

const app = express()
const port = process.env.PORT || 3000

app.use(express.static('public'))
app.use(express.json())
app.use('/api', mfaRoute)
app.use('/api', recaptchaRoute)

app.listen(port, () => console.log(`Listening on port ${port}`))