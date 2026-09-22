import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../ai/verification/verification.service';

export class VerificationController {
    private verificationService = new VerificationService();

    verifySummary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.verificationService.verifySummary(id as string);
            
            res.status(200).json({
                success: true,
                data: result,
                error: null
            });
        } catch (error) {
            next(error);
        }
    };
}
