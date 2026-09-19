import { AppError } from '../utils/AppError';

export class BaseRepository {
    protected handleError(error: any, context: string): never {
        console.error(`Database Error in ${context}:`, error);
        
        if (error.code === 'PGRST116') {
             throw new AppError('Resource not found', 404);
        }

        // Generic database error wrapping
        throw new AppError(
            `Database operation failed: ${error.message || 'Unknown error'}`,
            500
        );
    }
}
