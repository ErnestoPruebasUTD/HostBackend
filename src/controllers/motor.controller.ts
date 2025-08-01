import { Request, Response } from 'express';
import { SalidaMotor } from '../models/motor';


export const obtenerEstadoParaESP = async (req: Request, res: Response) => {
  try {
    const estadoActual = await SalidaMotor.findOne({ estado: true })
      .select('VERTICAL RIEGO AGITACION CASCADA MOSQUITOS')
      .lean();

    const response = {
      VERTICAL: estadoActual?.VERTICAL || false,
      RIEGO: estadoActual?.RIEGO || false,
      AGITACION: estadoActual?.AGITACION || false,
      CASCADA: estadoActual?.CASCADA || false,
      MOSQUITOS: estadoActual?.MOSQUITOS || false
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el estado para ESP32',
      detalles: error instanceof Error ? error.message : String(error)
    });
  }
};

// Endpoint para actualizar estados (usado desde el frontend/API)
export const actualizarEstadoMotores = async (req: Request, res: Response) => {
  try {
    const { VERTICAL, RIEGO, AGITACION, CASCADA, MOSQUITOS } = req.body;

    const motorData = {
      VERTICAL: VERTICAL ?? false,
      RIEGO: RIEGO ?? false,
      AGITACION: AGITACION ?? false,
      CASCADA: CASCADA ?? false,
      MOSQUITOS: MOSQUITOS ?? false,
      ultimaModificacion: new Date()
    };

    const nuevaSalida = await SalidaMotor.findOneAndUpdate(
      { estado: true },
      { $set: motorData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      exito: true,
      mensaje: 'Estados de motores actualizados',
      datos: nuevaSalida
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar estados de motores',
      detalles: error instanceof Error ? error.message : String(error)
    });
  }
};