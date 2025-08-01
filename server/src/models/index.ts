import { Sequelize } from 'sequelize';
import sequelize from '../config/db';
import Content from './content';
import User from './user';
import Screen from './screen';
import Layout from './layout';
import LayoutItem from './layoutitem';

const db = {
  sequelize,
  Sequelize,
  Content: Content(sequelize),
  User: User(sequelize),
  Screen: Screen(sequelize),
  Layout: Layout(sequelize),
  LayoutItem: LayoutItem(sequelize),
};

Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
