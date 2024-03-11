function showResultReCaptcha(text) {
  document.getElementById('result').innerHTML = text
}

function showResultUserVerify(text) {
  document.getElementById('userVerify').innerHTML = text
}

function resetForm() {
  document.getElementById('loginForm').reset()
}

function handleSubmit(evt, token) {
  evt.preventDefault()

  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
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
    })
    .catch(err => showResultReCaptcha(err))
    .finally(() => handleRecaptchaExecute())
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
      const { message, url, username } = jsonData

      if (message === 'verified') {
        resetForm()
        window.location.href = `/verification.html?qrURL=${url}&username=${username}`
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

function handleRecaptchaExecute(token) {
  grecaptcha.execute('6LdUlJIpAAAAAAWndAig2IIRrjEt7MzGXmw4WPcp', { action: 'verifyUser' })
    .then(token => {
      const loginForm = document.getElementById('loginForm')
      loginForm.addEventListener('submit', evt => handleSubmit(evt, token), { once: true })
    })
}