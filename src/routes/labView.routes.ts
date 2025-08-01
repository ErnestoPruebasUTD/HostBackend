import { Router } from 'express';
import bodyParser from 'body-parser';
import { createSensorRegister, getLastSensorRegister, getAllSensorRegisters } from '../controllers/sensor.controller';
import { getAllNotifications } from '../controllers/Notification.controller';
import { 
  obtenerEstadoParaESP,
  actualizarEstadoMotores
} from '../controllers/motor.controller';

const router = Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/createData', (req, res) => {
  createSensorRegister(req, res)
});

router.get('/lastRegister', async (req, res) => {
  getLastSensorRegister(req, res);
});

router.get('/allRegisters', async (req, res) => {
  getAllSensorRegisters(req, res);
});

router.get('/notifications', (req, res) => {
  getAllNotifications(req, res);
});

// Rutas para salidas de motor
router.get('/estado-esp', obtenerEstadoParaESP);

// Ruta para actualizar los estados desde el frontend/API
router.put('/actualizar-estados', actualizarEstadoMotores);

export default router;