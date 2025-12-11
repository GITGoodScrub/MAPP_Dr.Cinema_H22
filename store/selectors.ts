import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

// Memoized selectors to prevent unnecessary re-renders

// Movies selectors
export const selectMoviesState = (state: RootState) => state.movies;
export const selectMovies = (state: RootState) => state.movies.movies;
export const selectMoviesLoading = (state: RootState) => state.movies.loading;
export const selectMoviesError = (state: RootState) => state.movies.error;

// Cinemas selectors
export const selectCinemasState = (state: RootState) => state.cinemas;
export const selectCinemas = (state: RootState) => state.cinemas.cinemas;
export const selectCinemasLoading = (state: RootState) => state.cinemas.loading;
export const selectCinemasError = (state: RootState) => state.cinemas.error;

// Sorted cinemas (memoized)
export const selectSortedCinemas = createSelector(
    [selectCinemas],
    (cinemas) => [...cinemas].sort((a, b) => a.name.localeCompare(b.name))
);

// Upcoming movies selectors
export const selectUpcomingMoviesState = (state: RootState) => state.upcomingMovies;
export const selectUpcomingMovies = (state: RootState) => state.upcomingMovies.upcomingMovies;
export const selectUpcomingMoviesLoading = (state: RootState) => state.upcomingMovies.loading;
export const selectUpcomingMoviesError = (state: RootState) => state.upcomingMovies.error;

// Sorted upcoming movies by release date (memoized)
export const selectSortedUpcomingMovies = createSelector(
    [selectUpcomingMovies],
    (movies) => [...movies].sort((a, b) => {
        const dateA = a.omdb?.[0]?.Released ? new Date(a.omdb[0].Released).getTime() : 0;
        const dateB = b.omdb?.[0]?.Released ? new Date(b.omdb[0].Released).getTime() : 0;
        return dateA - dateB;
    })
);

// Favorites selectors
export const selectFavoritesState = (state: RootState) => state.favorites;
export const selectFavorites = (state: RootState) => state.favorites.favorites;
export const selectFavoritesLoading = (state: RootState) => state.favorites.loading;

// Check if a movie is favorited (parameterized selector)
export const selectIsMovieFavorited = (movieId: string) => 
    createSelector(
        [selectFavorites],
        (favorites) => favorites.some(movie => movie._id === movieId)
    );

// Get favorite count (memoized)
export const selectFavoritesCount = createSelector(
    [selectFavorites],
    (favorites) => favorites.length
);
