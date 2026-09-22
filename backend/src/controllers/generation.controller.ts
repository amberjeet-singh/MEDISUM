import { Request, Response, NextFunction } from 'express';
import { GenerationService } from '../ai/generation/generation.service';
import { GeneratedSummaryRepository } from '../repositories/generatedSummary.repository';

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

export const getGeneratedSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const encounterId = req.params.id as string;
        const repo = new GeneratedSummaryRepository();
        
        // Fetch the most recent generated summary for the encounter
        const summaries = await repo.findByEncounterId(encounterId);
        const summary = summaries.length > 0 ? summaries[0] : null;

        res.status(200).json({
            success: true,
            data: summary,
            error: null
        });
    } catch (error) {
        next(error);
    }
};
