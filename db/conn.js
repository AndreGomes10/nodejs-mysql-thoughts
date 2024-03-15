const { Sequelize } = require('sequelize')
                 // paretros = nome bando, usuario, senha
const sequelize = new Sequelize('toughts', 'root', 'mysql', {
    host: "localhost",
    dialect: 'mysql'  // dialetct = qual banco quero integrar
})

try {
    sequelize.authenticate()
    console.log('Conectamos com o Sequelize!')
  } catch (error) {
    console.error('Não foi possível conectar:', error)
  }
  
  module.exports = sequelize