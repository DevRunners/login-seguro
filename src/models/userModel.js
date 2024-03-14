const db = require('../../database/config')

const unverifiedUserProps = new Set(['id', 'username', 'password', 'temp_secret', 'session'])
const verifiedUserProps = new Set(['id', 'username', 'password', 'secret', 'session'])

async function getUser(username) {
  try {
    const users = await db.getData('/users')
    return users.find(user => user.username === username)
  } catch (err) {
    throw new Error('Empty database')
  }
}

async function addNewUser(username, data) {
  const alreadyRegistered = await existsUser(username)
  if (alreadyRegistered) {
    throw new Error('User is already registered')
  }

  const userData = filterProperties(data, unverifiedUserProps)
  await db.push('/users[]', userData)
  return userData
}

async function updateUser(username, updatedData) {
  const alreadyRegistered = await existsUser(username)
  if (!alreadyRegistered) {
    throw new Error('User is not registered')
  }

  userData = filterProperties(updatedData, verifiedUserProps)

  const index = await db.getIndex('/users', username, 'username')
  await db.push('/users[' + index + ']', userData)
  return userData
}

async function existsUser(username) {
  try {
    const users = await db.getData('/users')
    return Boolean(users.find(user => user.username === username))
  } catch (err) {
    throw new Error('Empty database')
  }
}

function filterProperties(data, whitelistedProps) {
  const userData = Object.keys(data)
    .filter(key => whitelistedProps.has(key))
    .reduce((acc, key) => {
      acc[key] = data[key]
      return acc
    }, {})

  return userData
}

async function changeSession(username, session) {
  const alreadyRegistered = await existsUser(username)
  if (!alreadyRegistered) {
    throw new Error('User is not registered')
  }

  const index = await db.getIndex('/users', username, 'username')
  db.push('/users[' + index + ']', { session }, false)
}

module.exports = {
  getUser,
  addNewUser,
  updateUser,
  changeSession
}