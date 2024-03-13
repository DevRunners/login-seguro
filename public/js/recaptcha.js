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

  //const publicKey = (await fetch('/api/publicKey')).json().publicKey

  const username = document.getElementById('username').value
  const password = document.getElementById('password').value

  //const passwordHash = jsrsasign.crypto.Cipher.encrypt(password, publicKey)

  const data = { username, password, token }

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