const { DataTypes } = require('sequelize')

const db = require('../db/conn')

// User
const User = require('./User')

const Tought = db.define('Tought', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true,
    }
})

Tought.belongsTo(User)  // pensamento pertence um usuario
User.hasMany(Tought)  // usuario tem muitos pensamentos. 1 pra muitos

module.exports = Tought