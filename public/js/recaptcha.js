bufferFrom = ethereumjs.Buffer.Buffer.from

let importedPublicKey

fetch('/api/publicKey')
  .then(response => response.json())
  .then(async jsonData => {
    const { publicKey } = jsonData
    importedPublicKey = await importPublicCrytoKey(publicKey)
  })
  .catch(err => console.error(err))

async function importPublicCrytoKey(publicKey) {
  const publicKeyBase64String = bufferFrom(publicKey).toString('ascii');
  console.log(publicKeyBase64String)
  const publicKeyBuffer = bufferFrom(publicKeyBase64String, 'base64');
  const publicCryptoKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    { name: 'RSA-OAEP', hash: "SHA-512" },
    false,
    ["encrypt"]
  )
  return publicCryptoKey
}

async function encryptPassowrd(publicCryptoKey, password) {
  try {
    const plainTextUInt8 = (new TextEncoder()).encode(password);
    const cypherTextBuffer = await crypto.subtle.encrypt(
      { name: "RSA-OAEP", hash: "SHA-512" },
      publicCryptoKey,
      plainTextUInt8
    )
    const cypherTextBase64 = bufferFrom(cypherTextBuffer).toString('base64');
    console.log(cypherTextBase64)
    return cypherTextBase64
  } catch (error) {
    return null
  }
}

function showResultReCaptcha(text) {
  document.getElementById('result').innerHTML = text
}

function showResultUserVerify(text) {
  document.getElementById('userVerify').innerHTML = text
}

function resetForm() {
  document.getElementById('loginForm').reset()
}

async function handleSubmit(evt, token) {
  evt.preventDefault()

  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const passwordEncrypted = await encryptPassowrd(importedPublicKey, password)

  if (passwordEncrypted === null) {
    alert('Error encrypting password')
    return
  }

  const data = { username, password: passwordEncrypted, token }

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
      const { success } = jsonData

      if (success) {
        showResultReCaptcha('ReCaptcha was successful')
        verifyUser(data)
      } else {
        showResultReCaptcha('ReCaptcha failed')
      }

      handleRecaptchaExecute()
    })
    .catch(err => showResultReCaptcha(err))
}

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
        alert('User verified')
        window.location.href = `/verification.html?username=${username}`
      } else {
        alert('User not verified')
        window.location.reload()
      }
    })
    .catch(error => showResultUserVerify(error))
}

grecaptcha.ready(() => {
  handleRecaptchaExecute()
})

function handleRecaptchaExecute() {
  grecaptcha.execute('6LdUlJIpAAAAAAWndAig2IIRrjEt7MzGXmw4WPcp', { action: 'verifyUser' })
    .then(token => {
      const loginForm = document.getElementById('loginForm')
      loginForm.addEventListener('submit', evt => handleSubmit(evt, token), { once: true })
    })
}