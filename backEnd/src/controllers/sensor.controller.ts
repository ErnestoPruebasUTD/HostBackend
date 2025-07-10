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