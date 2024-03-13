const fetch = require('isomorphic-fetch')
const bcrypt = require('bcrypt')
//const jsrsasign = require('jsrsasign')
const { getUser } = require('../models/userModel')

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

/*function generateRSAKeyPair() {
  const { prvKeyObj, pubKeyObj } = jsrsasign.KEYUTIL.generateKeypair('RSA', 2048)
  const privateKey = jsrsasign.KEYUTIL.getPEM(prvKeyObj, 'PKCS1PRV')
  const publicKey = jsrsasign.KEYUTIL.getPEM(pubKeyObj, 'PKCS8PUB')

  return { privateKey, publicKey }
}

const { privateKey, publicKey } = generateRSAKeyPair()
process.env.PUBLIC_KEY = publicKey
process.env.PRIVATE_KEY = privateKey

const a = jsrsasign.KEYUTIL.getKey(process.env.PUBLIC_KEY)

function sendPublicKey(req, res) {
  const publicKey = jsrsasign.KEYUTIL.getKey(process.env.PUBLIC_KEY)
  res.status(200).json({ publicKey })
}*/

async function verifyUser(req, res) {
  const { username, password } = req.body
  //const passwordCrypt = jsrsasign.crypto.Cipher.encrypt(passwordHash, process.env.PUBLIC_KEY)
  //const password = jsrsasign.crypto.Cipher.decrypt(passwordHash, process.env.PRIVATE_KEY)

  try {
    const user = await getUser(username)
    const match = await bcrypt.compare(password, user.password)
    if (match) {
      res.status(200).json({ message: 'verified', username: user.username })
    } else {
      res.status(200).json({ message: "not verified" })
    }
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado" })
  }
}

module.exports = {
  handleSend,
  verifyUser,
}
