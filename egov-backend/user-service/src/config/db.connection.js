const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
        define: {
            timestamps: true,
            freezeTableName: true,
        },
        logging: false
    }
);

module.exports = {
    Sequelize,
    sequelize
};