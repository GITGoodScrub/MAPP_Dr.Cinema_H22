import { Movie } from './types';

/**
 * Groups movies by cinema
 * Since a movie can be shown in multiple cinemas, it will appear in multiple groups
 */
export const groupMoviesByCinema = (movies: Movie[]) => {
    const grouped: { [cinemaId: number]: { cinemaName: string; movies: Map<string, Movie> } } = {};

    movies.forEach(movie => {
        if (movie.showtimes && movie.showtimes.length > 0) {
            movie.showtimes.forEach(showtime => {
                const cinemaName = showtime.cinema.name;
                const cinemaId = showtime.cinema.id;

                if (!grouped[cinemaId]) {
                    grouped[cinemaId] = {
                        cinemaName,
                        movies: new Map()
                    };
                }

                // Use title + year as unique key to prevent duplicates
                const movieKey = `${movie.title}-${movie.year}`;
                
                // Add movie to this cinema's list only if not already added
                if (!grouped[cinemaId].movies.has(movieKey)) {
                    grouped[cinemaId].movies.set(movieKey, movie);
                }
            });
        }
    });

    // Convert to array and sort by cinema name
    return Object.entries(grouped)
        .map(([cinemaId, data]) => ({
            cinemaName: data.cinemaName,
            cinemaId: parseInt(cinemaId),
            movies: Array.from(data.movies.values())
        }))
        .sort((a, b) => a.cinemaName.localeCompare(b.cinemaName));
};

/**
 * Formats duration in minutes to hours and minutes
 */
export const formatDuration = (minutes: number): string => {
    if (!minutes || isNaN(minutes)) {
        return '--';
    }
    
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

export interface MovieFilters {
    searchText?: string;
    minImdbRating?: number;
    minRottenRating?: number;
    showAfter?: string; // Time in HH:MM format
    showBefore?: string; // Time in HH:MM format
    pgRating?: string;
}

/**
 * Filters movies based on provided criteria
 */
export const filterMovies = (movies: Movie[], filters: MovieFilters): Movie[] => {
    return movies.filter(movie => {
        // Title, Actor, and Director search
        if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            const titleMatch = movie.title.toLowerCase().includes(searchLower);
            const actorMatch = movie.actors_abridged.some(a => 
                a.name.toLowerCase().includes(searchLower)
            );
            const directorMatch = movie.directors_abridged.some(d => 
                d.name.toLowerCase().includes(searchLower)
            );
            
            if (!titleMatch && !actorMatch && !directorMatch) {
                return false;
            }
        }

        // IMDB rating
        if (filters.minImdbRating !== undefined) {
            const imdbRating = parseFloat(movie.ratings.imdb);
            if (isNaN(imdbRating) || imdbRating < filters.minImdbRating) {
                return false;
            }
        }

        // Rotten Tomatoes rating
        if (filters.minRottenRating !== undefined) {
            const rottenRating = parseFloat(movie.ratings.rotten_critics);
            if (isNaN(rottenRating) || rottenRating < filters.minRottenRating) {
                return false;
            }
        }

        // Showtime range
        if (filters.showAfter || filters.showBefore) {
            let hasValidShowtime = false;
            
            for (const showtime of movie.showtimes) {
                for (const schedule of showtime.schedule) {
                    const showTime = schedule.time;
                    
                    if (filters.showAfter && showTime < filters.showAfter) {
                        continue;
                    }
                    if (filters.showBefore && showTime > filters.showBefore) {
                        continue;
                    }
                    
                    hasValidShowtime = true;
                    break;
                }
                if (hasValidShowtime) break;
            }
            
            if (!hasValidShowtime) {
                return false;
            }
        }

        // PG rating
        if (filters.pgRating) {
            if (!movie.certificate || !movie.certificate.is) {
                return false;
            }
            // Extract just the age number/letter from certificate (e.g., "12" from "12 ára")
            const certValue = movie.certificate.is.split(' ')[0];
            if (certValue !== filters.pgRating) {
                return false;
            }
        }

        return true;
    });
};
