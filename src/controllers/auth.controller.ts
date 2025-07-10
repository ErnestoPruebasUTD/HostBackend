import { Request, Response, NextFunction, RequestHandler } from "express";
import { generateAccessToken, validateToken } from "../utils/token";
import jwt from "jsonwebtoken";
import { cache } from "../utils/cache";
import dayjs from "dayjs";
import { User } from "../models/User"
import bcrypt from "bcrypt";

//En este archivo están todos los métodos relacionados con el token | controlador User

const ACCESS_SECRET = process.env.JWT_SECRET as string;
export const verifyUserByToken = (allowedRoles?: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        res.status(401).json({ message: 'Token requerido' });
        return;
      }

      const decoded = jwt.verify(token, ACCESS_SECRET) as { userId: string };
      const cachedToken = cache.get(decoded.userId);
      
      if (cachedToken !== token) {
        res.status(401).json({ message: 'Token inválido' });
        return;
      }

      const user = await User.findById(decoded.userId);
      if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        res.status(403).json({ message: 'Acceso denegado' });
        return;
      }

      (req as any).user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Autenticación fallida' });
    }
  };
};

export const loginMethod = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId, user.role);

    cache.set(userId, accessToken, 60 * 15);
      return res.status(200).json({ message: "Inicio de sesión exitoso", token: accessToken });


  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al logear usuario" });
  }
};

export const getTimeToken = (req: Request, res: Response) => {
    try {
        // Obtener y validar token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('Token requerido');
        
        const userId = validateToken(token);

        const ttl = cache.getTtl(userId);
        if (!ttl) throw new Error('Token expirado');

        const now = Date.now();
        const timeToLife = Math.floor((ttl - now) / 1000);
        const expTime = dayjs(ttl).format('HH:mm:ss');

        return res.json({ 
            creadoPor: userId,  // Aquí va quién creó el token
            timeToLife,
            expTime 
        });

    } catch (error) {
        return res.status(401).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
    }
};

