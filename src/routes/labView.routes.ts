import { Router } from 'express';
import bodyParser from 'body-parser';
import { createSensorRegister, getLastSensorRegister, getAllSensorRegisters } from '../controllers/sensor.controller';

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

export default router;