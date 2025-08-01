import { Router } from 'express';
import { getAllContent, createContent } from '../controllers/contentController';

import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/content', getAllContent);
router.post('/content', createContent);

export default router;
