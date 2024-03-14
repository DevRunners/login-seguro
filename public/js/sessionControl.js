const btnLogOut = document.getElementById('logout');

btnLogOut.addEventListener('click', async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const username = urlParams.get('username')
  try {
    await fetch('/api/changeSession', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })
    window.location.href = '/index.html'
  } catch (err) {
    console.log("Failed to change session")
  }
})