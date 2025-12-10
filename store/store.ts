import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './moviesSlice';
import cinemasReducer from './cinemasSlice';
import upcomingMoviesReducer from './upcomingMoviesSlice';
import favoritesReducer from './favoritesSlice';

export const store = configureStore({
    reducer: {
        movies: moviesReducer,
        cinemas: cinemasReducer,
        upcomingMovies: upcomingMoviesReducer,
        favorites: favoritesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['favorites/addFavorite', 'favorites/removeFavorite', 'favorites/reorderFavorites'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
