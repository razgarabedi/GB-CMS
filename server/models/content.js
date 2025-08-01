'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Content extends Model {
    static associate(models) {
      // define association here
    }
  }
  Content.init({
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    imageUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Content',
    tableName: 'Contents'
  });
  return Content;
}; 