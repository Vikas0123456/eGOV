const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.connection");

class likeDislikeModel extends Model {}

likeDislikeModel = sequelize.define(
    "knowledge_base_like_dislike",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    knowledgeBaseId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    islike: {
      type: DataTypes.ENUM('0', '1'),
    },
    createdDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updateDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  },
  {
    indexes: [
      {
        unique: true,
        using: "BTREE",
        fields: ["id"],
      },
    ],
    timestamps: false,
  }
);

module.exports = likeDislikeModel;
