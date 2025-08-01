import { Request, Response, Router } from "express";
import { createUser, getAllUsers, getUserByEmail, updateDataUserByAdmin, updateDataUserByUser, deleteUser, requestPasswordReset, resetPassword, getUserById } from "../controllers/users.controller";
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
router.get('/getUserbyId/:userId', (req: Request, res: Response) => {
  getUserById(req, res);
});
router.put('/updateDataUserByAdmin/:userId', verifyUserByToken(['Adm1ni$trad0r']), (req: Request, res: Response) => {
  updateDataUserByAdmin(req, res);
});
router.put('/updateDataUserByUser', verifyUserByToken(['Adm1ni$trad0r', 'M4ntenim1ent0', 'B0t4nic0', 'Default']), (req: Request, res: Response) => {
  updateDataUserByUser(req, res);
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