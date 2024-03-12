const { JsonDB, Config } = require('node-json-db')
const db = new JsonDB(new Config('database/users', true, true, '/'))

module.exports = db