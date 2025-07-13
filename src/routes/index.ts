import instaCaptionExtractor from "../controllers/instaCaptionExtractor";
import expandUrl from "../controllers/urlExpander";
import mailSenderBot from "../controllers/mailSenderBot";
import portfolioContact from "../controllers/portfolioContact";
import multer from "multer";
import { Router } from "express";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post("/caption", instaCaptionExtractor);
router.post("/url", expandUrl);
router.post("/mail", upload.single("file"), mailSenderBot);
router.post("/contact", portfolioContact);

export default router;