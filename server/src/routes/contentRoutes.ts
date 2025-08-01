const { Router } = require('express');
const {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
} = require('../controllers/contentController');

const router = Router();

router.post('/', createContent);
router.get('/', getAllContent);
router.get('/:id', getContentById);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

module.exports = router; 