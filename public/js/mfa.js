main()

async function main() {
  const isVerified = await isUserVerified()

  const otpForm = document.getElementById('otpForm')
  const unverifiedButtons = document.getElementById('unverifiedButtons')
  const showQRCodeButton = document.getElementById('showQR')
  const continueButton = document.getElementById('continue')

  showQRCodeButton.addEventListener('click', displayQRCode)
  continueButton.addEventListener('click', success)

  if (!isVerified) {
    otpForm.style.display = 'none'
    unverifiedButtons.style.display = 'block'
    otpForm.addEventListener('submit', evt => handleSubmit(evt, '/api/verifyToken'))
  } else {
    otpForm.addEventListener('submit', evt => handleSubmit(evt, '/api/validateToken'))
  }
}

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
    console.log("Failed to validate token")
  }
}

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
      resultText.innerText = 'Invalid token. Try again.'
    }
  } catch (err) {
    console.log("Failed to validate token")
  }
}

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

function success() {
  const urlParams = new URLSearchParams(window.location.search)
  const username = urlParams.get('username')
  fetch('/api/changeSession', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  })
  window.location.href = '/home.html?username=' + username
}