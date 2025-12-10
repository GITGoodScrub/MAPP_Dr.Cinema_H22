import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Movie, getUpcomingMovies } from '../Services';

interface UpcomingMoviesState {
    upcomingMovies: Movie[];
    loading: boolean;
    error: string | null;
}

const initialState: UpcomingMoviesState = {
    upcomingMovies: [],
    loading: false,
    error: null,
};

export const fetchUpcomingMovies = createAsyncThunk(
    'upcomingMovies/fetchUpcomingMovies',
    async () => {
        const response = await getUpcomingMovies();
        return response;
    }
);

const upcomingMoviesSlice = createSlice({
    name: 'upcomingMovies',
    initialState,
    reducers: {
        clearUpcomingMoviesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUpcomingMovies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUpcomingMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.loading = false;
                state.upcomingMovies = action.payload;
            })
            .addCase(fetchUpcomingMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch upcoming movies';
            });
    },
});

export const { clearUpcomingMoviesError } = upcomingMoviesSlice.actions;
export default upcomingMoviesSlice.reducer;
