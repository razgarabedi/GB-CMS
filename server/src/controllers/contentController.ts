const Content = require('../../models/content');

const createContent = async (req: any, res: any) => {
  try {
    const { title, body, imageUrl } = req.body;
    const newContent = await Content.create({ title, body, imageUrl });
    res.status(201).json(newContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create content' });
  }
};

const getAllContent = async (req: any, res: any) => {
  try {
    const content = await Content.findAll();
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

const getContentById = async (req: any, res: any) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (content) {
      res.json(content);
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

const updateContent = async (req: any, res: any) => {
  try {
    const { title, body, imageUrl } = req.body;
    const content = await Content.findByPk(req.params.id);
    if (content) {
      await content.update({ title, body, imageUrl });
      res.json(content);
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update content' });
  }
};

const deleteContent = async (req: any, res: any) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (content) {
      await content.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete content' });
  }
};

module.exports = {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
}; 