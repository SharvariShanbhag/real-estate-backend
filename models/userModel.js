const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const User = sequelize.define('User',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING(30),
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING(100),
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING(100),
        allowNull:false,
    },
    isAdmin:{
        type:DataTypes.BOOLEAN(),
        defaultValue:false
    }
},{
    tableName:'User',
    timestamps:true         //at created updated table it is true, otherwise false
})


module.exports = User