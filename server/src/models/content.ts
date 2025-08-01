import { Model, DataTypes, Sequelize } from 'sequelize';

class Content extends Model {
  public id!: number;
  public type!: string;
  public data!: string;
  public duration!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    // define association here
  }
}

export default (sequelize: Sequelize) => {
  Content.init({
    type: {
      type: DataTypes.STRING,
    },
    data: {
      type: DataTypes.TEXT,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'Content',
  });

  return Content;
};
