import { Router, Request, Response } from "express";
import { getTimeToken, loginMethod } from '../controllers/auth.controller';
import { loginWithGoogle } from "../controllers/loginWithGoogle.controller";

const router = Router();

// AUTH-CONTROLLER

router.post('/login-user', (req: Request, res: Response) => {
  loginMethod(req, res);
});
router.get('/timeTokenLife', (req: Request, res: Response) => {
  getTimeToken(req, res);
});
router.post('/login-google', (req: Request, res: Response) => {
  loginWithGoogle(req, res);
});

export default router;