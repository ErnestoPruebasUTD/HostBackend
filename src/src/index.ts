import express from 'express';
import morgan from 'morgan';
import http from 'http';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes';
import QRRoutes from './routes/qr.routes';
import toolInventoryRoutes from './routes/toolInventory.routes';
import botanicInventoryRoutes from "./routes/botanicInvetory.routes";
import labViewRoutes from './routes/labView.routes';
import userRoutes from './routes/users.routes';
import reportRoutes from './routes/report.routes';

import connectDB from './config/db';
import { setupWebSocket } from './Websocket/websocket';

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT_SERVER as string;

const allowedOrigins = [process.env.URL_FRONT, process.env.URL_MOBILE];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`No permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/botanic', botanicInventoryRoutes);
app.use('/api/qr', QRRoutes);
app.use('/api/toolInventory', toolInventoryRoutes);
app.use('/api/labView', labViewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Crea servidor HTTP para WebSocket
const server = http.createServer(app);
setupWebSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Servidor con WebSocket activo en el puerto:", PORT);
  });
});
