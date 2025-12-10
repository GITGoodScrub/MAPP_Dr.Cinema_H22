import AsyncStorage from "@react-native-async-storage/async-storage";

export type MovieReview = {
    rating: number;
    text: string;
};

const getReviewKey = (movieId: string | number) =>
    `review:${movieId}`;



export const saveReview = async (
    movieId: string | number,
    review: MovieReview,
    ): Promise<void> => {
        await AsyncStorage.setItem(
            getReviewKey(movieId),
            JSON.stringify(review),
        );
};

export const getReview = async (
    movieId: string | number,
    ): Promise<MovieReview | null> => {
        const data = await AsyncStorage.getItem(getReviewKey(movieId));
        return data ? (JSON.parse(data) as MovieReview) : null;
};

export const deleteReview = async (
    movieId: string | number,
    ): Promise<void> => {
        await AsyncStorage.removeItem(getReviewKey(movieId));
    };

