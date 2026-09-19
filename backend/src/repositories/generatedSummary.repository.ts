import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { GeneratedSummary, GeneratedSummaryInsert } from '../types/database.types';

export class GeneratedSummaryRepository extends BaseRepository {
    async create(summary: GeneratedSummaryInsert): Promise<GeneratedSummary> {
        const { data, error } = await supabase
            .from('generated_summaries')
            .insert(summary)
            .select()
            .single();

        if (error) this.handleError(error, 'GeneratedSummaryRepository.create');
        return data as GeneratedSummary;
    }

    async findById(id: string): Promise<GeneratedSummary | null> {
        const { data, error } = await supabase
            .from('generated_summaries')
            .select()
            .eq('id', id)
            .maybeSingle();

        if (error) this.handleError(error, 'GeneratedSummaryRepository.findById');
        return data as GeneratedSummary | null;
    }

    async findByEncounterId(encounterId: string): Promise<GeneratedSummary[]> {
        const { data, error } = await supabase
            .from('generated_summaries')
            .select()
            .eq('encounter_id', encounterId)
            .order('created_at', { ascending: false });

        if (error) this.handleError(error, 'GeneratedSummaryRepository.findByEncounterId');
        return data as GeneratedSummary[];
    }

    async updateStatus(id: string, status: string): Promise<GeneratedSummary> {
        const { data, error } = await supabase
            .from('generated_summaries')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) this.handleError(error, 'GeneratedSummaryRepository.updateStatus');
        return data as GeneratedSummary;
    }
}
