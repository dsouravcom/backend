import instaCaptionExtractor from "../controllers/instaCaptionExtractor";
import expandUrl from "../controllers/urlExpander";
import { Router } from "express";

const router = Router();

router.post("/caption", instaCaptionExtractor);
router.post("/url", expandUrl);

export default router;