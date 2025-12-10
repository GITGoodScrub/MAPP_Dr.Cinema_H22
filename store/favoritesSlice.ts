import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '../Services';

interface FavoritesState {
    favorites: Movie[];
    loading: boolean;
}

const initialState: FavoritesState = {
    favorites: [],
    loading: false,
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        setFavorites: (state, action: PayloadAction<Movie[]>) => {
            state.favorites = action.payload;
        },
        addFavoriteToStore: (state, action: PayloadAction<Movie>) => {
            const exists = state.favorites.some(m => m._id === action.payload._id);
            if (!exists) {
                state.favorites.push(action.payload);
            }
        },
        removeFavoriteFromStore: (state, action: PayloadAction<string>) => {
            state.favorites = state.favorites.filter(m => m._id !== action.payload);
        },
        reorderFavoritesInStore: (state, action: PayloadAction<Movie[]>) => {
            state.favorites = action.payload;
        },
        setFavoritesLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setFavorites,
    addFavoriteToStore,
    removeFavoriteFromStore,
    reorderFavoritesInStore,
    setFavoritesLoading,
} = favoritesSlice.actions;

// Async thunks for persistence
export const loadFavoritesFromStorage = () => async (dispatch: any) => {
    try {
        dispatch(setFavoritesLoading(true));
        const stored = await AsyncStorage.getItem('@favorites');
        if (stored) {
            const favorites = JSON.parse(stored);
            dispatch(setFavorites(favorites));
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    } finally {
        dispatch(setFavoritesLoading(false));
    }
};

export const addFavorite = (movie: Movie) => async (dispatch: any) => {
    try {
        dispatch(addFavoriteToStore(movie));
        const stored = await AsyncStorage.getItem('@favorites');
        const favorites = stored ? JSON.parse(stored) : [];
        const exists = favorites.some((m: Movie) => m._id === movie._id);
        if (!exists) {
            favorites.push(movie);
            await AsyncStorage.setItem('@favorites', JSON.stringify(favorites));
        }
    } catch (error) {
        console.error('Error adding favorite:', error);
    }
};

export const removeFavorite = (movieId: string) => async (dispatch: any) => {
    try {
        dispatch(removeFavoriteFromStore(movieId));
        const stored = await AsyncStorage.getItem('@favorites');
        if (stored) {
            const favorites = JSON.parse(stored);
            const updated = favorites.filter((m: Movie) => m._id !== movieId);
            await AsyncStorage.setItem('@favorites', JSON.stringify(updated));
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
    }
};

export const reorderFavorites = (movies: Movie[]) => async (dispatch: any) => {
    try {
        dispatch(reorderFavoritesInStore(movies));
        await AsyncStorage.setItem('@favorites', JSON.stringify(movies));
    } catch (error) {
        console.error('Error reordering favorites:', error);
    }
};

export default favoritesSlice.reducer;
