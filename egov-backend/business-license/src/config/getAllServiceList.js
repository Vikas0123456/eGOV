const { Sequelize } = require("sequelize");

// Function to create a Sequelize instance dynamically
const createSequelizeInstance = (database) => {
    return new Sequelize(
        database,
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: "mysql",
            define: {
                timestamps: true,
                freezeTableName: true,
            },
            logging: false,
        }
    );
};

// Function to get columns dynamically from a specific table
const getColumns = async (sequelize, tableName) => {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable(tableName);
    return columns;
};

// Function to fetch data using a specified Sequelize method across multiple databases
const fetchDataFromTables = async (serviceSlugs, tableName, method, methodOptions = {}) => {
    const results = {};
    const failedServices = [];

    for (const [index, slug] of serviceSlugs.entries()) {
        const databaseName = `egov_${slug}_service`;
        const sequelize = createSequelizeInstance(databaseName);

        try {
            // Dynamically get columns from the table
            const columns = await getColumns(sequelize, tableName);

            // Define the model with only existing fields
            const modelDefinition = {};
            for (const columnName in columns) {
                modelDefinition[columnName] = columns[columnName];
            }

            const Model = sequelize.define(tableName, modelDefinition, {
                timestamps: false,
            });

            // Fetch data using the specified method
            if (typeof Model[method] === 'function') {
                const data = await Model[method](methodOptions);
                results[index] = data;
            } else {
                throw new Error(`Method ${method} is not a valid Sequelize model method.`);
            }
        } catch (error) {
            console.error(`Error fetching data from ${databaseName}.${tableName} using ${method}:`, error);
            failedServices.push(databaseName);
        } finally {
            await sequelize.close(); // Close the connection after each attempt
        }
    }

    if (failedServices.length > 0) {
        console.warn(`Failed to fetch data from the following databases: ${failedServices.join(", ")}`);
    }

    return results;
};

module.exports = fetchDataFromTables;