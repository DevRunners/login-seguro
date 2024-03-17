const express = require("express") // Importa el framework Express
const { verifyUser, handleSend, sendPublicKey } = require('../controllers/recaptchaController') // Importa las funciones del controlador recaptchaController

const router = express.Router() // Crea un nuevo enrutador de Express

// Define las rutas y sus correspondientes controladores
router.post('/verifyUser', verifyUser) // Ruta para verificar al usuario
router.post('/send', handleSend) // Ruta para manejar el envío
router.get('/publicKey', sendPublicKey) // Ruta para obtener la clave pública

module.exports = router