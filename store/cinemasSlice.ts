import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Theater, getTheaters } from '../Services';

interface CinemasState {
    cinemas: Theater[];
    loading: boolean;
    error: string | null;
}

const initialState: CinemasState = {
    cinemas: [],
    loading: false,
    error: null,
};

export const fetchCinemas = createAsyncThunk(
    'cinemas/fetchCinemas',
    async () => {
        const response = await getTheaters();
        return response;
    }
);

const cinemasSlice = createSlice({
    name: 'cinemas',
    initialState,
    reducers: {
        clearCinemasError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCinemas.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCinemas.fulfilled, (state, action: PayloadAction<Theater[]>) => {
                state.loading = false;
                state.cinemas = action.payload;
            })
            .addCase(fetchCinemas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch cinemas';
            });
    },
});

export const { clearCinemasError } = cinemasSlice.actions;
export default cinemasSlice.reducer;
