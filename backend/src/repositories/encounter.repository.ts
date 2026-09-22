import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { Encounter, EncounterInsert } from '../types/database.types';

export class EncounterRepository extends BaseRepository {
    async create(encounter: EncounterInsert): Promise<Encounter> {
        const { data, error } = await supabase
            .from('encounters')
            .insert(encounter)
            .select()
            .single();

        if (error) this.handleError(error, 'EncounterRepository.create');
        return data as Encounter;
    }

    async findById(id: string): Promise<Encounter | null> {
        const { data, error } = await supabase
            .from('encounters')
            .select()
            .eq('id', id)
            .maybeSingle();

        if (error) this.handleError(error, 'EncounterRepository.findById');
        return data as Encounter | null;
    }

    async update(id: string, updates: Partial<EncounterInsert>): Promise<Encounter> {
        const { data, error } = await supabase
            .from('encounters')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) this.handleError(error, 'EncounterRepository.update');
        return data as Encounter;
    }

    async findByPatientId(patientId: string, page: number = 1, limit: number = 20): Promise<{ data: Encounter[], count: number }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('encounters')
            .select('*', { count: 'exact' })
            .eq('patient_id', patientId)
            .order('admission_datetime', { ascending: false })
            .range(from, to);

        if (error) this.handleError(error, 'EncounterRepository.findByPatientId');
        return { data: data as Encounter[], count: count || 0 };
    }
}
