const fetch = require('isomorphic-fetch') // Importa el módulo fetch para realizar solicitudes HTTP
const bcrypt = require('bcrypt') // Importa el módulo bcrypt para el hashing de contraseñas
const { getUser } = require('../models/userModel') // Importa la función para obtener un usuario del modelo de usuario
const { decryptedPassword } = require('../encrypt') // Importa la función para desencriptar contraseñas

// Función para manejar el envío del token reCAPTCHA y verificarlo
async function handleSend(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY // Obtiene la clave secreta de reCAPTCHA desde las variables de entorno
  const { token } = req.body // Extrae el token reCAPTCHA de la solicitud
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}` // Construye la URL de verificación

  try {
    const response = await fetch(url, { method: 'post' }) // Realiza una solicitud POST a la API de reCAPTCHA
    const data = await response.json() // Convierte la respuesta a formato JSON
    res.status(200).json(data) // Responde con los datos de verificación
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify token' }) // Responde con un mensaje de error si la verificación falla
  }
}

// Función para verificar las credenciales de un usuario
async function verifyUser(req, res) {
  const { username, password } = req.body // Extrae el nombre de usuario y la contraseña de la solicitud
  let plainTextPassword = await decryptedPassword(password) // Desencripta la contraseña

  try {
    const user = await getUser(username) // Obtiene el usuario de la base de datos
    const match = await bcrypt.compare(plainTextPassword, user.password) // Compara la contraseña proporcionada con la almacenada en la base de datos
    if (match) {
      res.status(200).json({ message: 'verified', username: user.username }) // Responde con un mensaje de verificación exitosa si las credenciales son válidas
    } else {
      res.status(200).json({ message: "not verified" }) // Responde con un mensaje de no verificación si las credenciales son inválidas
    }
  } catch (err) {
    res.status(500).json({ message: "Usuario no encontrado" }) // Responde con un mensaje de error si el usuario no se encuentra en la base de datos
  }
}

// Función para enviar la clave pública al cliente
async function sendPublicKey(req, res) {
  res.status(200).json({ publicKey: process.env.PUBLIC_KEY }) // Responde con la clave pública almacenada en las variables de entorno
}

module.exports = {
  handleSend,
  verifyUser,
  sendPublicKey
}