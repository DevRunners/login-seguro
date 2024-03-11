function showResultReCaptcha(text) {
  document.querySelector('#result').innerHTML = text
}

function showResultUserVerify(text) {
  document.querySelector('#userVerify').innerHTML = text
}

function resetForm() {
  document.querySelector('#loginForm').reset()
}

function handleClick(token) {
  return function () {
    let username = document.querySelector('#username').value
    let password = document.querySelector('#password').value
    let data = {
      username: username,
      password: password,
      token: token
    }

    fetch('/api/send', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(respone => {
        const { success, challenge_ts } = respone.google_response
        if (success && (new Date() - new Date(challenge_ts)) < 120000) {
          showResultReCaptcha('ReCaptcha was successful')
          fetch('/api/verifyUser', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
            .then(response => response.json())
            .then(response => {
              if (response.message === 'verified') {
                console.log('User verified')
                resetForm()
                window.location.href = `/verification.html?qrURL=${response.url}&username=${response.username}`
              } else {
                alert('User not verified')
                window.location.reload()
              }
            })
            .catch(error => showResultUserVerify(error))
        } else {
          showResultReCaptcha('ReCaptcha failed')
        }
      })
      .catch(error => showResultReCaptcha(error))
  }
}

grecaptcha.ready(function () {
  grecaptcha.execute('6LdUlJIpAAAAAAWndAig2IIRrjEt7MzGXmw4WPcp', { action: 'verifyUser' })
    .then(function (token) {
      document.querySelector('#login').addEventListener('click', handleClick(token))
    })
})