import { Router } from 'express';
import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
} from '../controllers/contentController';

const router = Router();

router.post('/', createContent);
router.get('/', getAllContent);
router.get('/:id', getContentById);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router; 