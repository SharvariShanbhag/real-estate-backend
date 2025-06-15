const {Sequelize} = require('sequelize')
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,{
        host:process.env.DB_HOST,
        dialect:"mysql",
        logging:false,
        dialectOptions:{
            // SSL options 
        }
    }
)

const connectDB = async() => {
    try {
        await sequelize.authenticate();
        console.log("Databse connected Successfully")

    // Automatically alter the tables to match model definitions (you can adjust this based on your need)

        await sequelize.sync({ alter: false })   

    } catch (error) {
        console.error("Unable to connect", error)
        process.exit(1);
    }
};

connectDB();

module.exports =  sequelize;