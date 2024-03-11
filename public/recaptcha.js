function showResultReCaptcha(text) {
  document.querySelector('#result').innerHTML = text
}

function showResultUserVerify(text) {
  document.querySelector('#userVerify').innerHTML = text
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

    fetch('/send', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify(data)
    })
      .then(response => response.text())
      .then(text => {
        showResultReCaptcha(text)
        fetch('/verifyUser', {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
          .then(response => response.json())
          .then(response => showResultUserVerify(response.message))
          .catch(error => showResultUserVerify(error))
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