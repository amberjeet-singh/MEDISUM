import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { ExtractedFact, ExtractedFactInsert } from '../types/database.types';

export class ExtractedFactRepository extends BaseRepository {
    async create(fact: ExtractedFactInsert): Promise<ExtractedFact> {
        const { data, error } = await supabase
            .from('extracted_facts')
            .insert(fact)
            .select()
            .single();

        if (error) this.handleError(error, 'ExtractedFactRepository.create');
        return data as ExtractedFact;
    }

    async findByEncounterId(encounterId: string): Promise<ExtractedFact[]> {
        const { data, error } = await supabase
            .from('extracted_facts')
            .select()
            .eq('encounter_id', encounterId)
            .order('created_at', { ascending: true });

        if (error) this.handleError(error, 'ExtractedFactRepository.findByEncounterId');
        return data as ExtractedFact[];
    }
}
