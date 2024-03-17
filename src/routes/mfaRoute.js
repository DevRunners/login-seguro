const express = require('express')
const { 
  addUser, // Función para registrar un usuario
  verifyToken, // Función para verificar un token
  validateToken, // Función para validar un token
  isVerified, // Función para verificar si un usuario está verificado
  qrUrl, // Función para obtener la URL del código QR
} = require('../controllers/mfaController') // Importa las funciones del controlador mfaController

const router = express.Router() // Crea un nuevo enrutador de Express

// Define las rutas y sus correspondientes controladores
router.post('/register', addUser) // Ruta para registrar un usuario
router.post('/verifyToken', verifyToken) // Ruta para verificar un token
router.post('/validateToken', validateToken) // Ruta para validar un token
router.post('/isVerified', isVerified) // Ruta para verificar si un usuario está verificado
router.post('/qrUrl', qrUrl) // Ruta para obtener la URL del código QR

module.exports = router
