import { google } from 'googleapis';
import fs from 'fs';

export const uploadFileToDrive = async (filePath: string, fileName: string) => {
  const rawCredentials = process.env.GCP_CREDENTIALS_BASE64!;
  const credentials = JSON.parse(Buffer.from(rawCredentials, 'base64').toString('utf-8'));
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata: any = {
    name: fileName,
  };

  if (process.env.DRIVE_FOLDER_ID) {
    fileMetadata.parents = [process.env.DRIVE_FOLDER_ID];
  }

  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(filePath),
  };

  media.body.on('error', (err) => {
    console.error('Error en el stream del archivo:', err);
  });

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });
    return response.data;
  } catch (error) {
    console.error('Error subiendo archivo a Drive:', error);
    throw error;
  }
};
