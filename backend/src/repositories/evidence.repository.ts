import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { Evidence, EvidenceInsert } from '../types/database.types';

export class EvidenceRepository extends BaseRepository {
    async create(evidence: EvidenceInsert): Promise<Evidence> {
        const { data, error } = await supabase
            .from('evidence')
            .insert(evidence)
            .select()
            .single();

        if (error) this.handleError(error, 'EvidenceRepository.create');
        return data as Evidence;
    }

    async findByClaimId(claimId: string): Promise<Evidence[]> {
        const { data, error } = await supabase
            .from('evidence')
            .select()
            .eq('claim_id', claimId)
            .order('rank', { ascending: true });

        if (error) this.handleError(error, 'EvidenceRepository.findByClaimId');
        return data as Evidence[];
    }
}
