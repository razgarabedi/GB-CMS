import { Router } from 'express';
import { getAllScreens, createScreen } from '../controllers/screenController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/screens', getAllScreens);
router.post('/screens', createScreen);

export default router;
