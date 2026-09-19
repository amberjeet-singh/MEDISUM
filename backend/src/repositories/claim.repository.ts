import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { Claim, ClaimInsert } from '../types/database.types';

export class ClaimRepository extends BaseRepository {
    async create(claim: ClaimInsert): Promise<Claim> {
        const { data, error } = await supabase
            .from('claims')
            .insert(claim)
            .select()
            .single();

        if (error) this.handleError(error, 'ClaimRepository.create');
        return data as Claim;
    }

    async findBySummaryId(summaryId: string): Promise<Claim[]> {
        const { data, error } = await supabase
            .from('claims')
            .select()
            .eq('summary_id', summaryId)
            .order('claim_order', { ascending: true });

        if (error) this.handleError(error, 'ClaimRepository.findBySummaryId');
        return data as Claim[];
    }
}
