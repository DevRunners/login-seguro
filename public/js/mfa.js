main() // Llama a la función principal al cargar la página

// Función principal
async function main() {
  // Verifica si el usuario está verificado
  const isVerified = await isUserVerified()

  // Elementos del DOM
  const otpForm = document.getElementById('otpForm')
  const unverifiedButtons = document.getElementById('unverifiedButtons')
  const showQRCodeButton = document.getElementById('showQR')
  const continueButton = document.getElementById('continue')

  // Agrega event listeners a los botones
  showQRCodeButton.addEventListener('click', displayQRCode)
  continueButton.addEventListener('click', success)

  // Oculta el formulario de OTP y muestra los botones de no verificado si el usuario no está verificado
  if (!isVerified) {
    otpForm.style.display = 'none'
    unverifiedButtons.style.display = 'block'
    otpForm.addEventListener('submit', evt => handleSubmit(evt, '/api/verifyToken')) // Maneja el envío del formulario para la verificación del token
  } else {
    otpForm.addEventListener('submit', evt => handleSubmit(evt, '/api/validateToken')) // Maneja el envío del formulario para la validación del token
  }
}

// Función para verificar si el usuario está verificado
async function isUserVerified() {
  const urlParams = new URLSearchParams(window.location.search)
  const username = urlParams.get('username')

  try {
    const response = await fetch('/api/isVerified', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })
    const { verified } = await response.json()

    return verified
  } catch (err) {
    console.log("Failed to verify user")
  }
}

// Función para obtener la URL del código QR
async function getQrCodeUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const username = urlParams.get('username')

  try {
    const response = await fetch('/api/qrUrl', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })
    const { qrUrl } = await response.json()

    return qrUrl
  } catch (err) {
    console.log("Failed to get QR code URL")
  }
}

// Función para validar el OTP
async function OTPValidation(url, data) {
  try {
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const { verified } = await response.json()

    return verified
  } catch (err) {
    alert('Failed to validate token')
    console.log("Failed to validate token")
  }
}

// Función para manejar el envío del formulario
async function handleSubmit(evt, url) {
  evt.preventDefault()

  const urlParams = new URLSearchParams(window.location.search)
  const tokenInput = document.getElementById('otp')
  const resultText = document.getElementById('result')

  const username = urlParams.get('username')
  const token = tokenInput.value

  try {
    const verified = await OTPValidation(url, { username, token })
    if (verified) {
      success()
    } else {
      alert('Token inválido')
    }
  } catch (err) {
    alert('Failed to validate token')
    console.log("Failed to validate token")
  }
}

// Función para mostrar el código QR
async function displayQRCode() {
  const qr = document.getElementById('qrcode')
  const showQRCodeButton = document.getElementById('showQR')
  const continueButton = document.getElementById('continue')
  const otpForm = document.getElementById('otpForm')

  qr.style.display = 'block'
  showQRCodeButton.style.display = 'none'
  continueButton.style.display = 'none'
  otpForm.style.display = 'flex'

  const qrURL = await getQrCodeUrl()

  const img = document.createElement('img')
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrURL}`

  qr.append(img)
}

// Función para el manejo de éxito
function success() {
  const urlParams = new URLSearchParams(window.location.search)
  const username = urlParams.get('username')
  alert('Verificación completa')
  window.location.href = '/home.html?username=' + username
}
