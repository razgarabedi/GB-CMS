import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import contentRoutes from './routes/contentRoutes';
import screenRoutes from './routes/screenRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api', screenRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('GB-CMS Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
