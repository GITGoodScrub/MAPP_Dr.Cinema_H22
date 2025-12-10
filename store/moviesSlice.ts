import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Movie, getMovies } from '../Services';

interface MoviesState {
    movies: Movie[];
    loading: boolean;
    error: string | null;
}

const initialState: MoviesState = {
    movies: [],
    loading: false,
    error: null,
};

export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async () => {
        const response = await getMovies();
        return response;
    }
);

const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        clearMoviesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.loading = false;
                state.movies = action.payload;
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch movies';
            });
    },
});

export const { clearMoviesError } = moviesSlice.actions;
export default moviesSlice.reducer;
