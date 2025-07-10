import { Request, Response, RequestHandler } from "express";
import {
  createQRSession,
  getTokenForQR,
  linkTokenToQR,
} from "../utils/qrCache";

export const handleCreateQR: RequestHandler = (req, res) => {
  const { sessionCode } = req.body;
  if (!sessionCode) {
    res.status(400).json({ message: "sessionCode requerido" });
    return;
  }
  createQRSession(sessionCode);
  res.sendStatus(200);
};

export const handleLinkToken: RequestHandler = (req, res) => {
  const { sessionCode } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!sessionCode || !token) {
    res.status(400).json({ message: "Token y sessionCode requeridos" });
    return;
  }

  const success = linkTokenToQR(sessionCode, token);
  if (success) {
    res.sendStatus(200);
  } else {
    res.status(404).json({ message: "Código no válido o expirado" });
  }
};

export const handleQRStatus: RequestHandler = (req, res) => {
  const { sessionCode } = req.params;
  if (!sessionCode) {
    res.status(400).json({ message: "sessionCode requerido" });
    return;
  }

  const token = getTokenForQR(sessionCode);
  res.json({ token });
};