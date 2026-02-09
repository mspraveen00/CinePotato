export type MediaType = 'movie' | 'tv' | 'game' | 'person' | 'episode' | 'franchise';

export interface SearchResult {
    id: string;
    title: string;
    originalTitle?: string;
    mediaType: MediaType;
    posterPath?: string;
    backdropPath?: string;
    releaseDate?: string; // YYYY-MM-DD
    overview?: string;
    rating?: number; // 0-10
    voteCount?: number;
    popularity?: number;
    genreIds?: number[];

    // Specific fields
    seasonNumber?: number;
    episodeNumber?: number;
    parentSeriesTitle?: string; // For episodes
    knownFor?: SearchResult[]; // For people
    awards?: string[];
    awardCategories?: string[];
}

export interface SearchFilters {
    query: string;
    mediaTypes: MediaType[];
    genres?: number[];
    minRating?: number;
    minVotes?: number;
    releaseYear?: number;
    releaseDecade?: number; // 1990, 2000, etc.
    runtimeMin?: number;
    runtimeMax?: number;
    certification?: string[];
    streamingProviders?: string[];
    language?: string[];
    country?: string[];
    company?: string[];
    userStatus?: 'seen' | 'unseen' | 'all';
    awards?: string[];
    awardCategories?: string[]; // e.g. 'best_picture', 'best_actor'
    subGenres?: string[];
    keywords?: string[];

    // Game specific
    platforms?: string[];
    developers?: string[];
    publishers?: string[];
}

export type SortOption = 'relevance' | 'rating_desc' | 'rating_asc' | 'popularity_desc' | 'popularity_asc' | 'date_desc' | 'date_asc' | 'votes_desc' | 'votes_asc';
