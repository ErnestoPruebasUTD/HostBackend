import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User } from "../models/User"
import { generateAccessToken } from "../utils/token";
import jwt from "jsonwebtoken";
import { cache } from "../utils/cache";
import { publishEmail } from "../services/emailQueueService";

//En este archivo hay metodos relacionados con la administracion de los users CRUD básico

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, phoneNumber, firstName, middleName, lastName } = req.body;

    if (!email || !password || !confirmPassword || !phoneNumber || !firstName || !middleName || !lastName) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben ser proporcionados." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "El correo electrónico no tiene un formato válido." });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden." });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "El número telefónico debe tener exactamente 10 dígitos numéricos." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({ message: "El correo o número telefónico ya están registrados." });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "Default"
    });

    const savedUser = await newUser.save();

    await publishEmail({
      type: 'welcome',
      data: {
        to: savedUser.email,
        name: savedUser.firstName // Usamos 'name' para coincidir con tu plantilla
      }
    });

    const userId = savedUser._id.toString();
    const accessToken = generateAccessToken(userId, savedUser.role);
    //almacenar el token al crear usuario
    cache.set(userId, accessToken, 60 * 15);

    return res.status(201).json({ 
      message: "Usuario creado correctamente", 
      user: savedUser, 
      accessToken 
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "Error interno al crear usuario.", 
      error: error instanceof Error ? error.message : error 
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userList = await User.find({ status: true });
    return res.status(200).json({ userList });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;
        const userEmail = await User.findOne({ email }); // Mi función para buscar por email

        if (!userEmail) {
            return res.status(404).json({ message: "Usuario no encontrado", userEmail });
        }

        return res.status(200).json({ userEmail });// Si se encuentra, devolverlo

    } catch (error) {
        return res.status(500).json({ message: "Error al buscar usuario", error });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const userPK = await User.findOne({ _id: userId }); // Mi función para buscar por userId

        if (!userPK) {
            return res.status(404).json({ message: "Usuario no encontrado", userPK });
        }

        return res.status(200).json({ userPK });// Si se encuentra, devolverlo

    } catch (error) {
        return res.status(500).json({ message: "Error al buscar usuario", error });
    }
};

export const updateDataUserByAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, role } = req.body;
    const loggedUser = (req as any).user;

    // Validación de autenticación
    if (!loggedUser) {
      return res.status(401).json({ message: "No autenticado. Debes iniciar sesión para realizar esta operación." });
    }

    const isAdmin = loggedUser.role === 'Adm1ni$trad0r';
    if (!isAdmin) {
      return res.status(403).json({ message: "Acceso denegado. Solo administradores pueden modificar estos datos." });
    }

    // Buscar al usuario por ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado. Verifica el ID proporcionado." });
    }

    // Actualizar status si viene en body
    if (typeof status !== 'undefined') {
      if (typeof status !== 'boolean') {
        return res.status(400).json({ message: "El valor de 'status' debe ser booleano (true o false)." });
      }
      user.status = status;
    }

    // Actualizar role si viene en body
    if (role) {
      const validRoles = ['Adm1ni$trad0r', 'M4ntenim1ent0', 'B0t4nic0', 'Default'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: "Rol inválido. Los roles permitidos son: 'Adm1ni$trad0r', 'M4ntenim1ent0', 'B0t4nic0' y 'Default'."
        });
      }
      user.role = role;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "Usuario actualizado correctamente.",
      updatedUser
    });

  } catch (error) {
    console.error("Error al actualizar datos de usuario:", error);

    return res.status(500).json({
      message: "Ocurrió un error inesperado al actualizar usuario.",
      error: (error instanceof Error ? error.message : String(error))
    });
  }
};

export const updateDataUserByUser = async (req: Request, res: Response) => {
  try {
    const {
      currentPassword,
      email,
      newPassword,
      phoneNumber,
      firstName,
      middleName,
      lastName
    } = req.body;

    const loggedUser = (req as any).user;
    if (!loggedUser) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const userId = loggedUser.id;
    const isAdmin = loggedUser.role === 'Adm1ni$trad0r';

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Validar currentPassword solo si quiere cambiar contraseña y no es admin
    if (newPassword && !isAdmin) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Debes proporcionar tu contraseña actual para cambiar la contraseña." });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Contraseña actual incorrecta." });
      }
    }

    // Email
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El correo electrónico no tiene un formato válido." });
      }
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists.id.toString() !== userId) {
        return res.status(409).json({ message: "El correo ya está registrado." });
      }
      user.email = email;
    }

    // Teléfono
    if (phoneNumber === undefined || phoneNumber === null) {
      return res.status(400).json({ message: "El número telefónico es obligatorio." });
    }

    if (typeof phoneNumber !== 'string' && typeof phoneNumber !== 'number') {
      return res.status(400).json({ message: "El número telefónico debe ser texto o número." });
    }

    const phoneStr = String(phoneNumber).trim();

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneStr)) {
      return res.status(400).json({ message: "El número telefónico debe tener exactamente 10 dígitos numéricos." });
    }


    // Contraseña
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({ message: "La nueva contraseña debe tener al menos 8 caracteres." });
      }
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    // Nombres
    if (firstName !== undefined && firstName !== user.firstName) {
      user.firstName = firstName;
    }

    if (middleName !== undefined && middleName !== user.middleName) {
      user.middleName = middleName;
    }

    if (lastName !== undefined && lastName !== user.lastName) {
      user.lastName = lastName;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "Datos actualizados correctamente.",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Error interno al actualizar usuario." });
  }
};



export const deleteUser = async (req:Request, res:Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user){
      return res.status(404).json({ message: "Usuario no existe" });
    }
    user.status = false;
    user.deleteDate = new Date;
    const deleteUser = await user.save();
    return res.status(201).json({ mesagge:"Usuario dado de baja con exitó", deleteUser });
  
  } catch (error) {
      return res.status(500).json({ message: "Error al querer dar de baja al usuario", error });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Buscar al usuario por su correo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '30m' }
    );

    const encodedToken = encodeURIComponent(token);

    const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${encodedToken}`;

    await publishEmail({
      type: 'resetPassword',
      data: {
        to: user.email,
        name: user.firstName,
        token: resetLink 
      }
    });

    res.status(200).json({ message: "Correo enviado para restablecer contraseña." });
  } catch (error) {
    console.error("Error en requestPasswordReset:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    res.status(400).json({ message: "Token inválido o expirado." });
  }
};