import { authenticatedFetch } from './authService';
import { Movie, Theater } from './types';

/**
 * Fetches movies with optional token parameter
 * Example: /movies?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
 */
export const getMovies = async (): Promise<Movie[]> => {
    try {
        const response = await authenticatedFetch('/movies');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
};

/**
 * Fetches theaters
 */
export const getTheaters = async (): Promise<Theater[]> => {
    try {
        const response = await authenticatedFetch('/theaters');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch theaters: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching theaters:', error);
        throw error;
    }
};
