// Importa la función bufferFrom de ethereumjs.Buffer.Buffer para crear un buffer desde una cadena
bufferFrom = ethereumjs.Buffer.Buffer.from

// Función asíncrona para obtener la clave pública del servidor
async function fetchPublicKey() {
  return await fetch('/api/publicKey')
    .then(response => response.json())
    .then(async jsonData => {
      const { publicKey } = jsonData
      let importedPublicKey = await importPublicCrytoKey(publicKey)
      return importedPublicKey
    })
    .catch(err => console.error(err))
}

// Función asíncrona para importar la clave pública criptográfica
async function importPublicCrytoKey(publicKey) {
  const publicKeyBase64String = bufferFrom(publicKey).toString('ascii')
  const publicKeyBuffer = bufferFrom(publicKeyBase64String, 'base64')
  const publicCryptoKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    { name: 'RSA-OAEP', hash: "SHA-512" },
    false,
    ["encrypt"]
  )
  return publicCryptoKey
}

// Función asíncrona para encriptar una contraseña con la clave pública
async function encryptPassowrd(publicCryptoKey, password) {
  try {
    const plainTextUInt8 = (new TextEncoder()).encode(password)
    const cypherTextBuffer = await crypto.subtle.encrypt(
      { name: "RSA-OAEP", hash: "SHA-512" },
      publicCryptoKey,
      plainTextUInt8
    )
    const cypherTextBase64 = bufferFrom(cypherTextBuffer).toString('base64')
    return cypherTextBase64
  } catch (error) {
    return null
  }
}

// Función para mostrar el resultado del captcha
function showResultReCaptcha(text) {
  document.getElementById('result').innerHTML = text
}

// Función para mostrar el resultado de la verificación de usuario
function showResultUserVerify(text) {
  document.getElementById('userVerify').innerHTML = text
}

// Función para resetear el formulario
function resetForm() {
  document.getElementById('loginForm').reset()
}

// Función para manejar el envío del formulario
async function handleSubmit(evt, token) {
  evt.preventDefault()

  const importedPublicKey = await fetchPublicKey()

  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const passwordEncrypted = await encryptPassowrd(importedPublicKey, password)

  if (passwordEncrypted === null) {
    console.error('Failed to encrypt password')
    return
  }

  const data = { username, password: passwordEncrypted, token }

  // Envia la solicitud al servidor
  fetch('/api/send', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(jsonData => {
      const { success, score } = jsonData
      if (success && score > 0.5) {
        showResultReCaptcha('ReCaptcha was successful')
        verifyUser(data)
      } else {
        showResultReCaptcha('ReCaptcha failed')
      }

      handleRecaptchaExecute()
    })
    .catch(err => showResultReCaptcha(err))
}

// Función para verificar al usuario
function verifyUser(data) {
  fetch('/api/verifyUser', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(jsonData => {
      const { message, username } = jsonData

      if (message === 'verified') {
        resetForm()
        alert('Inicio de sesión exitoso')
        window.location.href = `/verification.html?username=${username}`
      } else {
        alert("Credenciales incorrectas")
        window.location.reload()
      }
    })
    .catch(error => console.log("User verification failed"))
}

// Inicialización de reCaptcha
grecaptcha.ready(() => {
  handleRecaptchaExecute()
})

// Función para ejecutar reCaptcha
function handleRecaptchaExecute() {
  grecaptcha.execute('6LdUlJIpAAAAAAWndAig2IIRrjEt7MzGXmw4WPcp', { action: 'verifyUser' })
    .then(token => {
      const loginForm = document.getElementById('loginForm')
      loginForm.addEventListener('submit', evt => handleSubmit(evt, token), { once: true })
    })
}