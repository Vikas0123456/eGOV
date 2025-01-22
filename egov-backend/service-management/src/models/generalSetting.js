const { Model } = require("sequelize");

class GeneralSettingModel extends Model {}

const createGeneralSettingModel = (db) => {
    GeneralSettingModel.init(
        {
            id: {
                type: db.Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            settingKey: {
                type: db.Sequelize.STRING(255),
                allowNull: false,
            },
            settingValue: {
                type: db.Sequelize.STRING(255),
                allowNull: false,
            },
            description: {
                type: db.Sequelize.STRING(255),
                allowNull: true,
                comment: 'You can put the note about key value',
            },
            createdDate: {
                type: db.Sequelize.DATE,
                defaultValue: db.Sequelize.NOW,
            },
            updateDate: {
                type: db.Sequelize.DATE,
                defaultValue: db.Sequelize.NOW,
            },
        },
        {
            sequelize: db.sequelize,
            modelName: "general_setting",
            indexes: [
                {
                    unique: true,
                    using: 'BTREE',
                    fields: ['id'],
                },
            ],
            timestamps: false,
        }
    );

    return GeneralSettingModel;
};

module.exports = createGeneralSettingModel;
