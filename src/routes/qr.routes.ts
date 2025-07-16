import { Router } from "express";
import {
  handleCreateQR,
  handleLinkToken,
  handleQRStatus,
} from "../controllers/qr.controller";

const router = Router();

router.post("/create", handleCreateQR);
router.post("/link", handleLinkToken);
router.get("/status/:sessionCode", handleQRStatus);

export default router;

