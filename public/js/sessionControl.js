const btnLogOut = document.getElementById('logout')
btnLogOut.addEventListener('click', async () => {
  alert('Sesión cerrada')
  window.location.href = '/'
})