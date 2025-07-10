import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateAccessToken } from '../utils/token';
import { cache } from '../utils/cache';
import axios from 'axios';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    let payload: any;
    
    // Intenta verificar como ID Token primero
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (idTokenError) {
      // Si falla, intenta con el access_token
      const userInfo = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`
      );
      payload = userInfo.data;
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Token inválido' });
    }

    const email = payload.email;
    const firstName = payload.given_name || 'NoName';
    const lastName = payload.family_name || 'NoLastName';

    // 1. Verificar si ya existe el usuario
    let user = await User.findOne({ email });

    if (!user) {
      // 2. Crear usuario nuevo con valores por defecto válidos
      user = new User({
        email,
        firstName,
        middleName: ' ', // Espacio en blanco para cumplir con validación
        lastName,
        phoneNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        password: '-',
        role: 'Default',
        status: true
      });
      
      try {
        await user.save();
      } catch (saveError) {
        console.error("Error al guardar usuario:", saveError);
        return res.status(400).json({ 
          message: 'Error al crear usuario',
          details: (saveError as any)?.errors 
        });
      }
    }

    // 3. Generar JWT
    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId, user.role);
    cache.set(userId, accessToken, 60 * 15);

    return res.status(200).json({
      message: 'Inicio de sesión con Google exitoso',
      token: accessToken,
      user: {
        id: userId,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error general en autenticación:", error);
    return res.status(500).json({ 
      message: 'Error en inicio de sesión con Google',
      error: (error instanceof Error ? error.message : String(error))
    });
  }
};