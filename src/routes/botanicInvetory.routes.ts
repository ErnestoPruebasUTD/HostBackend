import { Request, Response, Router } from "express";
import { createBotanicInventory, getAllInventories, getInventoryById, updateInventoryByName, deletePlantFromInventoryByName } from "../controllers/botanic.controller";
import { verifyUserByToken } from "../controllers/auth.controller";

const router = Router();

router.post('/createBotanic', verifyUserByToken(['Adm1ni$trad0r','B0t4nic0']), (req: Request, res: Response) => {
    createBotanicInventory(req, res);
});
router.get('/getAll/Inventory', verifyUserByToken(['Adm1ni$trad0r','B0t4nic0']), (req: Request, res: Response) => {
    getAllInventories(req, res);
});
router.get('/getById/:id', verifyUserByToken(['Adm1ni$trad0r','B0t4nic0']), (req: Request, res: Response) => {
    getInventoryById(req, res);
});
router.put('/updateInventory/data/:name', verifyUserByToken(['Adm1ni$trad0r','B0t4nic0']), (req: Request, res: Response) => {
     updateInventoryByName(req, res);
});
router.delete('/deletePlant/:name', verifyUserByToken(['Adm1ni$trad0r','B0t4nic0']), (req: Request, res: Response) => {
    deletePlantFromInventoryByName(req, res);
});

export default router;