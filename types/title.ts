export interface HeroBannerProps {
    titleDetail: TitleDetail;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profileImageUrl: string | null;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    profileImageUrl: string | null;
}

export interface Season {
    id: number;
    name: string;
    seasonNumber: number;
    episodeCount: number;
    airDate: string | null;
    posterPath: string | null;
    overview: string;
}

export interface Episode {
    id: number;
    name: string;
    episodeNumber: number;
    seasonNumber: number;
    overview: string;
    airDate: string | null;
    runtime: number | null;
    stillPath: string | null;
    rating: number;
}

export interface EpisodeGroupList {
    id: string;
    name: string;
    description: string;
    episodeCount: number;
    groupCount: number;
    network: string | null;
    type: number;
}

export interface OMDbRatings {
    imdb?: string;
    metacritic?: string;
    rottenTomatoes?: string;
    rottenTomatoesUrl?: string; // Native URL directly from OMDb!
}

export interface KnownForCredit {
    id: string;
    title: string;
    posterUrl: string;
    mediaType: 'movie' | 'tv';
    year?: number;
    rating?: number;
    role?: string;
    voteCount?: number;
}

export interface TrailerVideo {
    id: string;
    key: string; // YouTube video key
    name: string;
    site: string; // "YouTube" etc.
    type: string; // "Trailer", "Teaser", "Clip", etc.
    official: boolean;
}

export interface CollectionInfo {
    id: number;
    name: string;
    posterPath: string | null;
    backdropPath: string | null;
    parts: CollectionPart[];
}

export interface CollectionPart {
    id: number;
    title: string;
    posterPath: string | null;
    releaseDate: string | null;
    overview: string;
    rating: number;
}

export interface WatchProviderItem {
    id: number;
    name: string;
    logoPath: string;
}

export interface WatchProvidersByCountry {
    link?: string;
    flatrate?: WatchProviderItem[];
    rent?: WatchProviderItem[];
    buy?: WatchProviderItem[];
    free?: WatchProviderItem[];
    ads?: WatchProviderItem[];
}

export interface WatchProvidersData {
    results: Record<string, WatchProvidersByCountry>;
}

export interface RecommendationItem {
    id: string;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    rating: number;
    releaseYear: number;
    mediaType: 'movie' | 'tv';
}

export interface KeywordItem {
    id: number;
    name: string;
}

export interface TitleDetail {
    id: string;
    title: string;
    overview: string;
    backdropImages: string[];
    posterPath: string;
    releaseYear: number;
    runtime: string; // e.g., "2h 15m"
    genres: string[];
    rating: number; // 0-10
    logos?: string[];
    posters?: string[];
    cast?: CastMember[];
    crew?: CrewMember[];
    seasons?: Season[];
    episodeGroups?: EpisodeGroupList[];
    omdbRatings?: OMDbRatings;
    imdbId?: string;
    mediaType?: 'movie' | 'tv' | 'game' | 'person';
    knownFor?: KnownForCredit[];
    birthday?: string;
    deathday?: string | null;
    placeOfBirth?: string;
    knownForDepartment?: string;
    gender?: string;
    profileImages?: string[];
    // Phase 1 additions
    trailers?: TrailerVideo[];
    certification?: string; // e.g., "PG-13", "R", "U/A 16+"
    collection?: CollectionInfo;
    tagline?: string;
    // Phase 2 additions
    watchProviders?: WatchProvidersData;
    recommendations?: RecommendationItem[];
    keywords?: KeywordItem[];
}

