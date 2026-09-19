import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { ClinicalNote, ClinicalNoteInsert } from '../types/database.types';

export class ClinicalNoteRepository extends BaseRepository {
    async create(note: ClinicalNoteInsert): Promise<ClinicalNote> {
        const { data, error } = await supabase
            .from('clinical_notes')
            .insert(note)
            .select()
            .single();

        if (error) this.handleError(error, 'ClinicalNoteRepository.create');
        return data as ClinicalNote;
    }

    async findById(id: string): Promise<ClinicalNote | null> {
        const { data, error } = await supabase
            .from('clinical_notes')
            .select()
            .eq('id', id)
            .maybeSingle();

        if (error) this.handleError(error, 'ClinicalNoteRepository.findById');
        return data as ClinicalNote | null;
    }

    async findByEncounterId(encounterId: string): Promise<ClinicalNote[]> {
        const { data, error } = await supabase
            .from('clinical_notes')
            .select()
            .eq('encounter_id', encounterId)
            .order('created_at', { ascending: true });

        if (error) this.handleError(error, 'ClinicalNoteRepository.findByEncounterId');
        return data as ClinicalNote[];
    }

    async listByEncounterId(encounterId: string, page: number = 1, limit: number = 20): Promise<{ data: ClinicalNote[], count: number }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('clinical_notes')
            .select('*', { count: 'exact' })
            .eq('encounter_id', encounterId)
            .order('created_at', { ascending: true })
            .range(from, to);

        if (error) this.handleError(error, 'ClinicalNoteRepository.listByEncounterId');
        return { data: data as ClinicalNote[], count: count || 0 };
    }
}
