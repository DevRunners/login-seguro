// Importa las clases JsonDB y Config desde el paquete 'node-json-db'
const { JsonDB, Config } = require('node-json-db')

// Crea una instancia de JsonDB con la configuración especificada
const db = new JsonDB(new Config('database/users', true, true, '/'))

// Exporta la instancia de JsonDB para su uso en otros módulos
module.exports = db