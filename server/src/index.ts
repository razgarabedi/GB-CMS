const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const sequelize = require('../models');
const contentRoutes = require('./routes/contentRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/content', contentRoutes);

app.get("/", (req: any, res: any) => {
  res.send("Express + TypeScript Server");
});

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}); 