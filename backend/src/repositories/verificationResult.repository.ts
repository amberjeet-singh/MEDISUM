import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { VerificationResult, VerificationResultInsert } from '../types/database.types';

export class VerificationResultRepository extends BaseRepository {
    async create(result: VerificationResultInsert): Promise<VerificationResult> {
        const { data, error } = await supabase
            .from('verification_results')
            .insert(result)
            .select()
            .single();

        if (error) this.handleError(error, 'VerificationResultRepository.create');
        return data as VerificationResult;
    }

    async findByClaimId(claimId: string): Promise<VerificationResult | null> {
        const { data, error } = await supabase
            .from('verification_results')
            .select()
            .eq('claim_id', claimId)
            .maybeSingle();

        if (error) this.handleError(error, 'VerificationResultRepository.findByClaimId');
        return data as VerificationResult | null;
    }
}
