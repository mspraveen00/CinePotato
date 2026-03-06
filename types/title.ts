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
}
