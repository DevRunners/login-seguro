const uuid = require('uuid') // Importa el módulo para generar UUIDs
const speakeasy = require('speakeasy') // Importa el módulo para autenticación de dos factores
const bcrypt = require('bcrypt') // Importa el módulo para el hashing de contraseñas
const {
  getUser,
  addNewUser,
  updateUser,
  changeSession
} = require('../models/userModel') // Importa las funciones del modelo userModel

// Función para registrar un nuevo usuario
async function addUser(req, res) {
  const id = uuid.v4() // Genera un nuevo UUID
  const { username, password } = req.body // Extrae el nombre de usuario y la contraseña de la solicitud
  const saltRounds = 10 // Número de rondas de sal para el hashing de la contraseña
  const hashedPassword = await bcrypt.hash(password, saltRounds) // Genera un hash de la contraseña

  try {
    const temp_secret = speakeasy.generateSecret() // Genera un secreto temporal para la autenticación de dos factores
    await addNewUser(username, { id, temp_secret, username, password: hashedPassword, session: false }) // Agrega un nuevo usuario a la base de datos

    res.status(200).json({ message: `Usuario ${username} registrado con éxito` }) // Responde con un mensaje de éxito
  } catch (err) {
    res.status(500).json({ message: 'El usuario no se ha podido registrar' }) // Responde con un mensaje de error
  }
}

// Función para verificar un token de autenticación de dos factores
async function verifyToken(req, res) {
  const { token, username } = req.body // Extrae el token y el nombre de usuario de la solicitud

  try {
    const user = await getUser(username) // Obtiene el usuario de la base de datos

    if (!user) {
      throw new Error('User is not registered') // Lanza un error si el usuario no está registrado
    }

    if (!user.temp_secret) {
      throw new Error('User has already been verified') // Lanza un error si el usuario ya ha sido verificado
    }

    const { base32: secret } = user.temp_secret // Obtiene el secreto temporal
    const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token }) // Verifica el token

    if (verified) {
      updateUser(username, { ...user, secret: user.temp_secret }) // Actualiza los datos del usuario con el secreto verificado
    }

    res.status(200).json({ verified }) // Responde con un objeto que indica si el token fue verificado correctamente
  } catch (err) {
    res.status(500).json({ message: "Falló la verificación del token" }) // Responde con un mensaje de error
  }
}

// Función para validar un token de autenticación de dos factores
async function validateToken(req, res) {
  const { token, username } = req.body // Extrae el token y el nombre de usuario de la solicitud

  try {
    const user = await getUser(username) // Obtiene el usuario de la base de datos

    if (!user) {
      throw new Error('User is not registered') // Lanza un error si el usuario no está registrado
    }

    if (!user.secret) {
      throw new Error('User has not been verified') // Lanza un error si el usuario no ha sido verificado
    }

    const { base32: secret } = user.secret // Obtiene el secreto
    const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token }) // Verifica el token

    res.status(200).json({ verified }) // Responde con un objeto que indica si el token fue verificado correctamente
  } catch (err) {
    res.status(500).json({ message: "Fallo la validación del token" }) // Responde con un mensaje de error
  }
}

// Función para verificar si un usuario está verificado
async function isVerified(req, res) {
  const { username } = req.body // Extrae el nombre de usuario de la solicitud

  try {
    const user = await getUser(username) // Obtiene el usuario de la base de datos

    res.status(200).json({ verified: Boolean(user.secret) }) // Responde con un objeto que indica si el usuario está verificado
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado" }) // Responde con un mensaje de error
  }
}

// Función para obtener la URL del código QR para la autenticación de dos factores
async function qrUrl(req, res) {
  const { username } = req.body // Extrae el nombre de usuario de la solicitud

  try {
    const user = await getUser(username) // Obtiene el usuario de la base de datos

    if (!user.temp_secret) {
      throw new Error('User has already been verified') // Lanza un error si el usuario ya ha sido verificado
    }

    res.status(200).json({ qrUrl: user.temp_secret.otpauth_url }) // Responde con la URL del código QR
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado" }) // Responde con un mensaje de error
  }
}

// Función para cambiar la sesión de un usuario
async function changeUserSession(req, res) {
  const { username } = req.body // Extrae el nombre de usuario de la solicitud

  try {
    const user = await getUser(username) // Obtiene el usuario de la base de datos

    if (!user) {
      throw new Error('User is not registered') // Lanza un error si el usuario no está registrado
    }

    await changeSession(username, !user.session) // Cambia la sesión del usuario

    res.status(200).json({ message: `Sesión de usuario ${username} actualizada` }) // Responde con un mensaje de éxito
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado" }) // Responde con un mensaje de error
  }
}

module.exports = {
  addUser,
  verifyToken,
  validateToken,
  isVerified,
  qrUrl,
  changeUserSession
}
