import { Router, Request, Response, RequestHandler } from 'express';
import { createTool, getAllTools, getToolById, updateTool, deleteTool } from '../controllers/toolInventory.controller';
import { verifyUserByToken } from '../controllers/auth.controller';

const router = Router();

router.get( '/get-all', verifyUserByToken(['Adm1ni$trad0r', 'M4ntenim1ent0']), (req: Request, res: Response) => {
        getAllTools(req, res);
});

router.get('/get-one/:id', verifyUserByToken(['Adm1ni$trad0r', 'M4ntenim1ent0']), (req: Request, res: Response) => {
    getToolById(req, res);
});

router.post('/new', verifyUserByToken(['Adm1ni$trad0r', 'M4ntenim1ent0']), (req: Request, res: Response) => {
    createTool(req, res);
});

router.put('/update/:id', verifyUserByToken(['Adm1ni$trad0r', 'M4ntenim1ent0']), (req: Request, res: Response) => {
    updateTool(req, res);
});

router.delete('/delete/:id', verifyUserByToken(['Adm1ni$trad0r', 'M4ntenim1ent0']), (req: Request, res: Response) => {
    deleteTool(req, res);
});

export default router