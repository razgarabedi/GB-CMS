import { Request, Response } from 'express';
import db from '../models';
const { Content } = db;

export const getAllContent = async (req: Request, res: Response) => {
  try {
    const content = await Content.findAll();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const { type, data, duration } = req.body;
    const newContent = await Content.create({ type, data, duration });
    res.status(201).json(newContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create content' });
  }
};
