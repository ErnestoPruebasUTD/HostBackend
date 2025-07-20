import { Request, Response } from 'express';
import { SensorData } from '../models/Sensor';

export const createSensorRegister = async (req: Request, res: Response) => {
    try {
    let jsonData;
    
    if (req.headers['content-type']?.includes('application/json')) {
      jsonData = req.body;
    }
    else {
      const rawData = Object.keys(req.body)[0];
      jsonData = JSON.parse(rawData);
    }

    const { Temperatura, PH, Conductividad, Nivel } = jsonData;
    
    if ([Temperatura, PH, Conductividad, Nivel].some(v => typeof v !== 'number')) {
      return res.status(400).json({ error: 'Todos los valores deben ser numéricos' });
    }


    const nuevoRegistro = new SensorData({
      sensors: [{
        temperature : Temperatura,
        ph : PH,
        conductivity : Conductividad,
        level : Nivel
      }],
    });

    await nuevoRegistro.save();

    res.status(201).json({
      success: true,
      message: 'Registro de sensor guardado correctamente',
      data: nuevoRegistro
    });

    

  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({
      error: 'Error procesando datos',
      detalles: error instanceof Error ? error.message : String(error),
      formato_esperado: 'JSON directo o form-data con JSON stringificado'
    });
  }
}

export const getLastSensorRegister = async (req: Request, res: Response) => {
  try {
    const lastRegister = await SensorData.findOne({ status: true }).sort({ createDate: -1 });
    if (!lastRegister) {
      return res.status(404).json({ message: 'No hay registros de sensores.' });
    }
    res.status(200).json({ data: lastRegister });
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el último registro',
      detalles: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAllSensorRegisters = async (req: Request, res: Response) => {
  try {
    const allRegisters = await SensorData.find({ status: true }).sort({ createDate: -1 });

    if (allRegisters.length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros de sensores.' });
    }

    res.status(200).json({
      success: true,
      count: allRegisters.length,
      data: allRegisters,
    });
  } catch (error) {
    console.error('Error al obtener todos los registros:', error);
    res.status(500).json({
      error: 'Error al obtener todos los registros',
      detalles: error instanceof Error ? error.message : String(error),
    });
  }
};