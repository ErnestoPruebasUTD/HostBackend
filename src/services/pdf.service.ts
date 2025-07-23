import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import type { ISensorData } from '../models/Sensor';

/**
 * Carga el logo y lo convierte a Base64
 */
const loadLogoBase64 = (): string => {
  const imagePath = path.resolve(__dirname, '../assets', 'logo.png');
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error leyendo la imagen del logo:', error);
    return '';
  }
};

const logoBase64 = loadLogoBase64();

/**
 * Genera el HTML a partir de los datos de sensores
 */
const buildHTML = (data: ISensorData[]): string => {
  const rows = data.map((entry, idx) => {
    const sensor = entry.sensors[0]; // solo la primera lectura del array
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${new Date(entry.createDate).toLocaleString()}</td>
        <td>${sensor?.ph?.toFixed(2) ?? '-'}</td>
        <td>${sensor?.conductivity?.toFixed(2) ?? '-'}</td>
        <td>${sensor?.temperature?.toFixed(2) ?? '-'}</td>
        <td>${sensor?.level?.toFixed(2) ?? '-'}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0 20px;
        }
        header {
          text-align: center;
          margin: 20px 0;
        }
        header img {
          height: 80px;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
          color: #2c8fa7;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th {
          background-color: #5ca94d;
          color: white;
          padding: 8px;
          border: 1px solid #ccc;
        }
        td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: center;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <header>
        <img src="data:image/png;base64,${logoBase64}" alt="Logo Empresa" />
      </header>
      <h1>Reporte de Lecturas de Invernadero</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>pH</th>
            <th>Conductividad</th>
            <th>Temperatura (°C)</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;
};

/**
 * Genera un PDF con los datos de sensores y lo guarda en el outputPath
 */
export const generateSensorPDF = async (
  sensorData: ISensorData[],
  outputPath: string
): Promise<void> => {
  const html = buildHTML(sensorData);

  // 🛡️ Railway-friendly config
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '40px',
      bottom: '40px',
      left: '30px',
      right: '30px',
    },
  });

  await browser.close();
};
