let qr = document.getElementById('qrcode')

const urlParams = new URLSearchParams(window.location.search)
const qrURL = urlParams.get('qrURL')

qr.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrURL}" />`

let btnShow = document.querySelector('#showQR')

btnShow.addEventListener('click', () => {
  qr.style.display = 'block'
  btnShow.style.display = 'none'
})

document.querySelector('#verifyOTP').addEventListener('click', () => {
  let token = document.querySelector('#otp').value
  let username = urlParams.get('username')
  let data = {
    token,
    username
  }

  fetch('/api/verifyToken', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(response => {
      if (response.verified) {
        window.location.href = '/home.html'
      } else {
        alert('Token not verified')
      }
    })
})