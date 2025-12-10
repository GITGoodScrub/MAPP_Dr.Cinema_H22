import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from './types';

const FAVORITES_KEY = '@favorites';

/**
 * Get all favorite movies
 */
export const getFavorites = async (): Promise<Movie[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
};

/**
 * Add a movie to favorites
 */
export const addFavorite = async (movie: Movie): Promise<void> => {
    try {
        const favorites = await getFavorites();
        
        // Check if already in favorites
        if (favorites.some(fav => fav._id === movie._id)) {
            return;
        }
        
        favorites.push(movie);
        const jsonValue = JSON.stringify(favorites);
        await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

/**
 * Remove a movie from favorites
 */
export const removeFavorite = async (movieId: string): Promise<void> => {
    try {
        const favorites = await getFavorites();
        const filtered = favorites.filter(fav => fav._id !== movieId);
        const jsonValue = JSON.stringify(filtered);
        await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

/**
 * Check if a movie is in favorites
 */
export const isFavorite = async (movieId: string): Promise<boolean> => {
    try {
        const favorites = await getFavorites();
        return favorites.some(fav => fav._id === movieId);
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
};

/**
 * Reorder favorites
 */
export const reorderFavorites = async (movies: Movie[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(movies);
        await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
    } catch (error) {
        console.error('Error reordering favorites:', error);
        throw error;
    }
};
