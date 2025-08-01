import { Model, DataTypes, Sequelize } from 'sequelize';

class Layout extends Model {
  public id!: number;
  public name!: string;
  public rows!: number;
  public cols!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    Layout.hasMany(models.Screen);
    Layout.hasMany(models.LayoutItem);
  }
}

export default (sequelize: Sequelize) => {
  Layout.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rows: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cols: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Layout',
  });

  return Layout;
};
