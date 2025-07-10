import { Request, Response, Router } from "express";
import { createUser, getAllUsers, getUserByEmail, updateDataUser, deleteUser, requestPasswordReset, resetPassword } from "../controllers/users.controller";
import { verifyUserByToken } from "../controllers/auth.controller";

const router = Router();

// USERS-CONTROLLER

router.post('/createUser', (req: Request, res: Response) => {
  createUser(req, res);
});
router.get('/getAllUsers', verifyUserByToken(['Adm1ni$trad0r']), (req: Request, res: Response) => {
  getAllUsers(req, res);
});
router.get('/getUser/:email', verifyUserByToken(['Adm1ni$trad0r']), (req: Request, res: Response) => {
  getUserByEmail(req, res);
});
router.put('/updateDataUser/:userId', verifyUserByToken(['Adm1ni$trad0r']), (req: Request, res: Response) => {
  updateDataUser(req, res);
});
router.patch('/deleteUser/:userId', verifyUserByToken(['Adm1ni$trad0r']), (req: Request, res: Response) => {
  deleteUser(req, res);
});
router.post("/request/passwordReset", (req: Request, res: Response) => {
  requestPasswordReset(req, res)
});
router.post("/resetPassword", (req: Request, res: Response) => {
  resetPassword(req, res)
});

export default router;