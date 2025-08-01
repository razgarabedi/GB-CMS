import { Model, DataTypes, Sequelize } from 'sequelize';

class LayoutItem extends Model {
  public id!: number;
  public row!: number;
  public col!: number;
  public width!: number;
  public height!: number;
  public LayoutId!: number;
  public ContentId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    LayoutItem.belongsTo(models.Layout);
    LayoutItem.belongsTo(models.Content);
  }
}

export default (sequelize: Sequelize) => {
  LayoutItem.init({
    row: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    col: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'LayoutItem',
  });

  return LayoutItem;
};
