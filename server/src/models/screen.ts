import { Model, DataTypes, Sequelize } from 'sequelize';

class Screen extends Model {
  public id!: number;
  public name!: string;
  public description!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    Screen.belongsTo(models.Layout);
  }
}

export default (sequelize: Sequelize) => {
  Screen.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Screen',
  });

  return Screen;
};
