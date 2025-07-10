import { Router, Request, Response } from 'express';
import { generatePDFReport } from '../controllers/report.controller';

const router = Router();

router.get('/generate', (req: Request, res: Response) => {
  generatePDFReport(req, res);
});

export default router;
