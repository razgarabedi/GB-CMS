import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from '../models';
import contentRoutes from './routes/contentRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/content', contentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}); 