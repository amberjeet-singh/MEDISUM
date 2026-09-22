import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller';

const router = Router();
const verificationController = new VerificationController();

// Note: Endpoint to verify a generated summary
router.post('/summaries/:id/verify', verificationController.verifySummary);

export default router;
