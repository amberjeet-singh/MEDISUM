import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { Patient, PatientInsert } from '../types/database.types';

export class PatientRepository extends BaseRepository {
    async create(patient: PatientInsert): Promise<Patient> {
        const { data, error } = await supabase
            .from('patients')
            .insert(patient)
            .select()
            .single();

        if (error) this.handleError(error, 'PatientRepository.create');
        return data as Patient;
    }

    async findById(id: string): Promise<Patient | null> {
        const { data, error } = await supabase
            .from('patients')
            .select()
            .eq('id', id)
            .maybeSingle();

        if (error) this.handleError(error, 'PatientRepository.findById');
        return data as Patient | null;
    }

    async update(id: string, updates: Partial<PatientInsert>): Promise<Patient> {
        const { data, error } = await supabase
            .from('patients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) this.handleError(error, 'PatientRepository.update');
        return data as Patient;
    }

    async findByExternalRef(externalRef: string): Promise<Patient | null> {
        const { data, error } = await supabase
            .from('patients')
            .select()
            .eq('external_patient_ref', externalRef)
            .maybeSingle();

        if (error) this.handleError(error, 'PatientRepository.findByExternalRef');
        return data as Patient | null;
    }

    async list(page: number, limit: number, query?: string): Promise<{ data: Patient[], count: number }> {
        let queryBuilder = supabase
            .from('patients')
            .select('*', { count: 'exact' });

        if (query) {
            queryBuilder = queryBuilder.ilike('external_patient_ref', `%${query}%`);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await queryBuilder
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) this.handleError(error, 'PatientRepository.list');
        return { data: data as Patient[], count: count || 0 };
    }
}
