export interface DetailedCollectionMovie {
    id: number;
    title: string;
    originalTitle?: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string | null;
    releaseYear: number | null;
    rating: number;
    voteCount: number;
    runtime: number; // in minutes
    formattedRuntime: string; // e.g. "2h 32m"
    budget: number;
    revenue: number;
    formattedRevenue: string; // e.g. "$1.03B" or "$450M"
    formattedBudget: string;
    director?: string;
    topCast?: {
        id: number;
        name: string;
        character: string;
        profilePath: string | null;
    }[];
    genres?: string[];
}

export interface CollectionImage {
    filePath: string;
    aspectRatio: number;
    width: number;
    height: number;
    voteAverage: number;
    voteCount: number;
    iso_639_1?: string | null;
}

export interface CollectionCastMember {
    id: number;
    name: string;
    character: string;
    profilePath: string | null;
    filmCount: number;
    movieTitles: string[];
}

export interface CollectionDirector {
    name: string;
    filmCount: number;
    movieTitles: string[];
}

export interface CollectionStats {
    totalFilms: number;
    totalRevenue: number;
    totalBudget: number;
    formattedRevenue: string;
    formattedBudget: string;
    totalRuntimeMinutes: number;
    formattedTotalRuntime: string;
    averageRuntimeMinutes: number;
    formattedAverageRuntime: string;
    averageRating: number;
    releaseSpan: string; // e.g. "2001 - 2011"
    highestGrossingFilm?: {
        id: number;
        title: string;
        revenue: number;
        formattedRevenue: string;
        posterPath: string | null;
    };
    highestRatedFilm?: {
        id: number;
        title: string;
        rating: number;
        posterPath: string | null;
    };
}

export interface CollectionDetail {
    id: number;
    name: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    parts: DetailedCollectionMovie[];
    stats: CollectionStats;
    recurringCast: CollectionCastMember[];
    directors: CollectionDirector[];
    images: {
        backdrops: CollectionImage[];
        posters: CollectionImage[];
    };
}
