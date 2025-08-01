import { Model, DataTypes, Sequelize } from 'sequelize';

class Content extends Model {
  public id!: number;
  public title!: string;
  public body!: string;
  public imageUrl!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initContentModel = (sequelize: Sequelize) => {
  Content.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'Contents',
    }
  );
};

export default Content;