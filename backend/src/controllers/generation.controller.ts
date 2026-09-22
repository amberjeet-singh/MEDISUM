import { Request, Response, NextFunction } from 'express';
import { GenerationService } from '../ai/generation/generation.service';

export const generateSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const encounterId = req.params.id as string;
        const generationService = new GenerationService();

        const result = await generationService.generateDischargeSummary(encounterId);

        res.status(200).json({
            success: true,
            data: result,
            error: null
        });
    } catch (error) {
        next(error);
    }
};
