export interface AuthCredentials {
    username: string;
    password: string;
}

export interface AuthToken {
    token: string;
    expiresAt: number; // timestamp
}

// Movie related types
export interface MovieActor {
    name: string;
}

export interface MovieDirector {
    name: string;
}

export interface MovieCertificate {
    is: string;
    color: string;
    number: string;
}

export interface MovieGenre {
    ID: number;
    Name: string;
    NameEN: string;
}

export interface MovieIds {
    imdb: string;
    rotten: string;
    tmdb: string;
}

export interface MovieRatings {
    imdb: string;
    rotten_audience: string;
    rotten_critics: string;
}

export interface MovieShowtimeSchedule {
    time: string;
    purchase_url: string;
    info: string;
}

export interface MovieShowtimeCinema {
    id: number;
    name: string;
}

export interface MovieShowtime {
    cinema: MovieShowtimeCinema;
    cinema_name: string;
    schedule: MovieShowtimeSchedule[];
}

export interface MovieOMDB {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: any[];
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    tomatoMeter: string;
    tomatoImage: string;
    tomatoRating: string;
    tomatoReviews: string;
    tomatoFresh: string;
    tomatoRotten: string;
    tomatoConsensus: string;
    tomatoUserMeter: string;
    tomatoUserRating: string;
    tomatoUserReviews: string;
    tomatoURL: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
}

export interface Movie {
    _id: string;
    id: number;
    title: string;
    actors_abridged: MovieActor[];
    alternativeTitles: string;
    certificate: MovieCertificate;
    certificateIS: string;
    certificateImg: string;
    directors_abridged: MovieDirector[];
    durationMinutes: number;
    genres: MovieGenre[];
    ids: MovieIds;
    omdb: MovieOMDB[];
    plot: string;
    poster: string;
    ratings: MovieRatings;
    showtimes: MovieShowtime[];
    trailers: any[];
    year: string;
}

// Theater types
export interface Theater {
    id: number;
    name: string;
    address: string;
    city: string;
    phone: string;
    website: string;
    description: string;
    google_map: string;
}
