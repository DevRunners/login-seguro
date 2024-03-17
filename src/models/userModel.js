const db = require('../../database/config') // Importa la configuración de la base de datos

// Propiedades de usuario no verificado y verificado
const unverifiedUserProps = new Set(['id', 'username', 'password', 'temp_secret', 'session'])
const verifiedUserProps = new Set(['id', 'username', 'password', 'secret', 'session'])

// Función para obtener un usuario por nombre de usuario
async function getUser(username) {
  try {
    const users = await db.getData('/users') // Obtiene los datos de la base de datos
    return users.find(user => user.username === username) // Encuentra y devuelve el usuario correspondiente al nombre de usuario dado
  } catch (err) {
    throw new Error('Empty database') // Lanza un error si la base de datos está vacía
  }
}

// Función para agregar un nuevo usuario
async function addNewUser(username, data) {
  const alreadyRegistered = await existsUser(username) // Verifica si el usuario ya está registrado
  if (alreadyRegistered) {
    throw new Error('User is already registered') // Lanza un error si el usuario ya está registrado
  }

  const userData = filterProperties(data, unverifiedUserProps) // Filtra las propiedades del usuario
  await db.push('/users[]', userData) // Agrega el nuevo usuario a la base de datos
  return userData // Devuelve los datos del nuevo usuario
}

// Función para actualizar los datos de un usuario
async function updateUser(username, updatedData) {
  const alreadyRegistered = await existsUser(username) // Verifica si el usuario ya está registrado
  if (!alreadyRegistered) {
    throw new Error('User is not registered') // Lanza un error si el usuario no está registrado
  }

  userData = filterProperties(updatedData, verifiedUserProps) // Filtra las propiedades actualizadas del usuario

  const index = await db.getIndex('/users', username, 'username') // Obtiene el índice del usuario en la base de datos
  await db.push('/users[' + index + ']', userData) // Actualiza los datos del usuario en la base de datos
  return userData // Devuelve los datos actualizados del usuario
}

// Función para verificar si un usuario existe
async function existsUser(username) {
  try {
    const users = await db.getData('/users') // Obtiene los datos de la base de datos
    return Boolean(users.find(user => user.username === username)) // Devuelve true si el usuario existe, de lo contrario, false
  } catch (err) {
    throw new Error('Empty database') // Lanza un error si la base de datos está vacía
  }
}

// Función para filtrar las propiedades de un objeto de usuario
function filterProperties(data, whitelistedProps) {
  const userData = Object.keys(data)
    .filter(key => whitelistedProps.has(key))
    .reduce((acc, key) => {
      acc[key] = data[key]
      return acc
    }, {})

  return userData // Devuelve las propiedades filtradas del usuario
}

// Función para cambiar la sesión de un usuario
async function changeSession(username, session) {
  const alreadyRegistered = await existsUser(username) // Verifica si el usuario ya está registrado
  if (!alreadyRegistered) {
    throw new Error('User is not registered') // Lanza un error si el usuario no está registrado
  }

  const index = await db.getIndex('/users', username, 'username') // Obtiene el índice del usuario en la base de datos
  db.push('/users[' + index + ']', { session }, false) // Actualiza la sesión del usuario en la base de datos
}

module.exports = {
  getUser,
  addNewUser,
  updateUser, 
  changeSession
};
