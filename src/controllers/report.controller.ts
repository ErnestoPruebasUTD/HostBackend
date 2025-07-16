import path from 'path';
import fs from 'fs/promises';
import { Request, Response } from 'express';
import { SensorData } from '../models/Sensor';
import { generateSensorPDF } from '../services/pdf.service';
import { uploadFileToDrive } from '../services/upploadToDrive.service';

export const generatePDFReport = async (req: Request, res: Response) => {
  try {
    const data = await SensorData.find().sort({ createDate: -1 }).limit(300);

    if (!data.length) {
      return res.status(404).json({ message: 'No hay datos para generar el reporte' });
    }

    const fileName = `reporte-invernadero-${Date.now()}.pdf`;
    const tempDir = path.join(__dirname, '../../temp');
    const outputPath = path.join(tempDir, fileName);

    await fs.mkdir(tempDir, { recursive: true });

    await generateSensorPDF(data, outputPath);

    try {
      await fs.access(outputPath);
    } catch {
      throw new Error('El archivo PDF no fue creado correctamente.');
    }

    const driveResponse = await uploadFileToDrive(outputPath, fileName);

    await fs.unlink(outputPath);

    return res.status(200).json({
      message: 'Reporte generado correctamente',
      path: outputPath,
      fileName,
      driveLink: driveResponse.webViewLink,
    });
  } catch (error) {
    console.error('Error generando reporte:', error);
    return res.status(500).json({ message: 'Error interno al generar el reporte' });
  }
};
