// controllers/notification.controller.ts
import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

// Obtener todas las notificaciones
export const getAllNotifications = async (_req: Request, res: Response) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notificaciones', error });
  }
};
