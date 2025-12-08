import { Movie } from './types';

/**
 * Groups movies by cinema
 * Since a movie can be shown in multiple cinemas, it will appear in multiple groups
 */
export const groupMoviesByCinema = (movies: Movie[]) => {
    const grouped: { [cinemaName: string]: { cinemaId: number; movies: Movie[] } } = {};

    movies.forEach(movie => {
        if (movie.showtimes && movie.showtimes.length > 0) {
            movie.showtimes.forEach(showtime => {
                const cinemaName = showtime.cinema_name;
                const cinemaId = showtime.cinema.id;

                if (!grouped[cinemaName]) {
                    grouped[cinemaName] = {
                        cinemaId,
                        movies: []
                    };
                }

                // Add movie to this cinema's list
                grouped[cinemaName].movies.push(movie);
            });
        }
    });

    // Convert to array and sort by cinema name
    return Object.entries(grouped)
        .map(([cinemaName, data]) => ({
            cinemaName,
            cinemaId: data.cinemaId,
            movies: data.movies
        }))
        .sort((a, b) => a.cinemaName.localeCompare(b.cinemaName));
};

/**
 * Formats duration in minutes to hours and minutes
 */
export const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins}m`;
    }
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
};
