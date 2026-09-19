import { supabase } from '../config/supabase';
import { BaseRepository } from './base.repository';
import { DoctorReview, DoctorReviewInsert } from '../types/database.types';

export class DoctorReviewRepository extends BaseRepository {
    async create(review: DoctorReviewInsert): Promise<DoctorReview> {
        const { data, error } = await supabase
            .from('doctor_reviews')
            .insert(review)
            .select()
            .single();

        if (error) this.handleError(error, 'DoctorReviewRepository.create');
        return data as DoctorReview;
    }

    async findBySummaryId(summaryId: string): Promise<DoctorReview | null> {
        const { data, error } = await supabase
            .from('doctor_reviews')
            .select()
            .eq('summary_id', summaryId)
            .maybeSingle();

        if (error) this.handleError(error, 'DoctorReviewRepository.findBySummaryId');
        return data as DoctorReview | null;
    }

    async update(id: string, updates: Partial<DoctorReviewInsert>): Promise<DoctorReview> {
        const { data, error } = await supabase
            .from('doctor_reviews')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
            
        if (error) this.handleError(error, 'DoctorReviewRepository.update');
        return data as DoctorReview;
    }
}
