export interface HeroBannerProps {
    titleDetail: TitleDetail;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profileImageUrl: string | null;
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
    cast?: CastMember[];
}
