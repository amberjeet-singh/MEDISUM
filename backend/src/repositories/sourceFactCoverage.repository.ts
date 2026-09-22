import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { SourceFactCoverage, SourceFactCoverageInsert } from '../types/database.types';

export class SourceFactCoverageRepository extends BaseRepository {
    async create(coverage: SourceFactCoverageInsert): Promise<SourceFactCoverage> {
        const { data, error } = await supabase
            .from('source_fact_coverage')
            .insert(coverage)
            .select()
            .single();

        if (error) this.handleError(error, 'SourceFactCoverageRepository.create');
        return data as SourceFactCoverage;
    }

    async findBySummaryId(summaryId: string): Promise<SourceFactCoverage[]> {
        const { data, error } = await supabase
            .from('source_fact_coverage')
            .select()
            .eq('summary_id', summaryId);

        if (error) this.handleError(error, 'SourceFactCoverageRepository.findBySummaryId');
        return data as SourceFactCoverage[];
    }
}
