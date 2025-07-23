import { WebSocketServer, WebSocket } from 'ws';
import { Notification } from '../models/Notification';
import { Server } from 'http';

export const clients = new Set<WebSocket>();

type ThresholdRange = { min: number; max: number };

let thresholds: Record<string, ThresholdRange> = {
  temperature: { min: 10, max: 40 },
  ph: { min: 6.5, max: 8.0 },
  conductivity: { min: 0.5, max: 2.5 },
  level: { min: 10, max: 100 },
};

// Iniciar WebSocket
export const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'connected', message: 'Conectado al sistema de alertas' }));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  return wss;
};

// Función para emitir alerta y guardar notificación
export const broadcastAlert = async (alertData: {
  sensor: string;
  value: number;
  alertType: string;
  timestamp?: string;
  parameter?: string;  // Nombre amigable del sensor
}) => {
  try {
    const fullData = {
      ...alertData,
      timestamp: alertData.timestamp ? new Date(alertData.timestamp) : new Date(),
    };

    // Guardar en MongoDB
    const notification = new Notification({
      message: `Nueva alerta de ${alertData.sensor}`,
      data: fullData,
    });
    await notification.save();

    // Enviar por WebSocket
    const socketMessage = JSON.stringify({
      type: 'alert',
      ...fullData,
    });

    for (const client of clients) {
      client.send(socketMessage);
    }
  } catch (error) {
    console.error('Error al procesar la notificación:', error);
  }
};

// Actualizar rangos permitidos
export const updateThresholds = (newThresholds: Partial<Record<string, ThresholdRange>>) => {
  for (const key in newThresholds) {
    if (thresholds[key]) {
      thresholds[key] = {
        min: newThresholds[key]!.min ?? thresholds[key].min,
        max: newThresholds[key]!.max ?? thresholds[key].max,
      };
    }
  }
};

export const getThresholds = () => thresholds;