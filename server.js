const express = require('express') // Importa el framework Express
const path = require('path') // Proporciona utilidades para trabajar con rutas de archivos y directorios
require('dotenv').config() // Carga las variables de entorno desde un archivo .env

const mfaRoute = require('./src/routes/mfaRoute') // Importa el enrutador para la autenticación multifactor (MFA)
const recaptchaRoute = require('./src/routes/recaptchaRoute') // Importa el enrutador para la integración de reCAPTCHA
const { setEnvVariables } = require('./src/encrypt') // Importa una función para configurar variables de entorno seguras

setEnvVariables() // Ejecuta la función para configurar las variables de entorno

const app = express() // Crea una instancia de la aplicación Express
const port = process.env.PORT || 3000 // Obtiene el puerto del archivo .env o utiliza el puerto 3000 por defecto

// Configuración de middleware para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, '/public')))

// Configuración de middleware para analizar el cuerpo de las solicitudes entrantes como JSON
app.use(express.json())

// Configuración de middleware para establecer encabezados de seguridad en todas las respuestas
app.use((req, res, next) => {
  // Encabezado para exigir que las solicitudes futuras se realicen a través de HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  // Protección contra ataques de script entre sitios (XSS)
  res.setHeader('X-XSS-Protection', '1; mode=block')
  // Prevenir MIME-sniffing para tipos de contenido
  res.setHeader('X-Content-Type-Options', 'nosniff')
  // Establecer una política de seguridad de contenido para recursos cargados
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'")
  // Controlar cómo se envía el encabezado Referer en las solicitudes HTTP y HTTPS
  res.setHeader('Referrer-Policy', 'origin-when-cross-origin')
  // Controlar si una página puede ser incluida dentro de un marco o iframe
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  // Especificar qué políticas de seguridad entre dominios están permitidas en un archivo crossdomain.xml
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
  // Controlar qué características del navegador pueden ser utilizadas en la página
  res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'; camera 'none'")
  // Ocultar información sobre el servidor
  res.setHeader('Server', '')
  // Ocultar información sobre el software utilizado para ejecutar el servidor web
  res.setHeader('X-Powered-By', '')
  // Permitir el acceso a recursos desde un origen específico a través de solicitudes CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  next();
});

// Configuración de middleware para enrutar solicitudes que comienzan con '/api' a los enrutadores correspondientes
app.use('/api', mfaRoute)
app.use('/api', recaptchaRoute)

// Inicia el servidor en el puerto especificado y muestra un mensaje de consola
app.listen(port, () => console.log(`Listening on port ${port}`))
