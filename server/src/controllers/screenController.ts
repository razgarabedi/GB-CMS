import { Request, Response } from 'express';
import db from '../models';

const { Screen } = db;

export const getAllScreens = async (req: Request, res: Response) => {
  try {
    const screens = await Screen.findAll();
    res.json(screens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve screens' });
  }
};

export const createScreen = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const newScreen = await Screen.create({ name, description });
    res.status(201).json(newScreen);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create screen' });
  }
};
