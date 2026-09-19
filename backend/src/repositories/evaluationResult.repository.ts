import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { EvaluationResult, EvaluationResultInsert } from '../types/database.types';

export class EvaluationResultRepository extends BaseRepository {
    async create(result: EvaluationResultInsert): Promise<EvaluationResult> {
        const { data, error } = await supabase
            .from('evaluation_results')
            .insert(result)
            .select()
            .single();

        if (error) this.handleError(error, 'EvaluationResultRepository.create');
        return data as EvaluationResult;
    }

    async findBySummaryId(summaryId: string): Promise<EvaluationResult[]> {
        const { data, error } = await supabase
            .from('evaluation_results')
            .select()
            .eq('summary_id', summaryId)
            .order('created_at', { ascending: false });

        if (error) this.handleError(error, 'EvaluationResultRepository.findBySummaryId');
        return data as EvaluationResult[];
    }
}
