import { fetchTMDB } from '@/lib/api/tmdb';
import { TitleDetail } from '@/types/title';
import { generateMockTVDetail, generateMockItems } from '@/lib/mock-data';

interface TMDBTVShow {
    id: number;
    name: string;
    overview: string;
    first_air_date: string;
    episode_run_time: number[];
    genres: { id: number; name: string }[];
    vote_average: number;
    poster_path: string;
    backdrop_path: string;
    original_language: string;
}

interface TMDBImage {
    aspect_ratio: number;
    height: number;
    iso_639_1: string | null;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
}

interface TMDBImagesResponse {
    backdrops: TMDBImage[];
    logos: TMDBImage[];
    posters: TMDBImage[];
}

export async function getTVDetail(id: string): Promise<TitleDetail | null> {
    const useMock = process.env.USE_MOCK === 'true';

    if (useMock) {
        console.log(`[Mock Mode] Fetching TV details for ID: ${id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateMockTVDetail(id);
    }

    try {
        console.log(`[Real Mode] Fetching TV Data for ID: ${id}`);

        const tvPromise = fetchTMDB<TMDBTVShow>(`/tv/${id}`);
        const imagesPromise = fetchTMDB<TMDBImagesResponse>(`/tv/${id}/images`).catch(error => {
            console.error("Failed to fetch TMDB images:", error);
            return { backdrops: [], logos: [], posters: [] } as TMDBImagesResponse;
        });

        const [tv, images] = await Promise.all([tvPromise, imagesPromise]);

        // Logo Logic
        const logos: string[] = [];

        const getBestLogo = (lang: string | null) => {
            const matches = images.logos.filter(l => l.iso_639_1 === lang);
            if (matches.length === 0) return null;
            matches.sort((a, b) => {
                if (b.vote_average !== a.vote_average) return b.vote_average - a.vote_average;
                return b.width - a.width;
            });
            return matches[0];
        };

        const origLang = tv.original_language;
        let originalLogo = null;

        if (origLang && origLang !== 'en') {
            originalLogo = getBestLogo(origLang);
            if (originalLogo) {
                logos.push(`https://image.tmdb.org/t/p/original${originalLogo.file_path}`);
            }
        }

        const englishLogos = images.logos.filter(l => l.iso_639_1 === 'en' || l.iso_639_1 === null)
            .sort((a, b) => {
                if (b.vote_average !== a.vote_average) return b.vote_average - a.vote_average;
                return b.width - a.width;
            });

        if (originalLogo) {
            if (englishLogos.length > 0) {
                logos.push(`https://image.tmdb.org/t/p/original${englishLogos[0].file_path}`);
            }
        } else {
            englishLogos.slice(0, 2).forEach(logo => {
                logos.push(`https://image.tmdb.org/t/p/original${logo.file_path}`);
            });
        }

        // Backdrop Logic
        const topBackdrops = images.backdrops
            .sort((a, b) => b.vote_average - a.vote_average)
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 20)
            .map(b => `https://image.tmdb.org/t/p/original${b.file_path}`);

        if (topBackdrops.length === 0 && tv.backdrop_path) {
            topBackdrops.push(`https://image.tmdb.org/t/p/original${tv.backdrop_path}`);
        }

        // Runtime Logic (average or first)
        const runtime = tv.episode_run_time && tv.episode_run_time.length > 0
            ? `${tv.episode_run_time[0]}m`
            : "N/A";

        return {
            id: String(tv.id),
            title: tv.name, // Map name to title
            overview: tv.overview,
            backdropImages: topBackdrops,
            posterPath: tv.poster_path
                ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
                : "",
            releaseYear: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : 0,
            runtime: runtime,
            genres: tv.genres.map(g => g.name),
            rating: parseFloat(tv.vote_average.toFixed(1)),
            logos: logos.length > 0 ? logos : undefined,
        };

    } catch (error) {
        console.error(`Failed to fetch TV details for ID ${id}:`, error);
        return null;
    }
}

// -----------------------------------------------------------------------------
// Explore Shelf Data Fetching
// -----------------------------------------------------------------------------

import { ExploreItem } from '@/lib/constants/explore';

interface TMDBListResponse {
    results: TMDBTVShow[];
}

export async function getExploreTVs(shelfId: string): Promise<ExploreItem[]> {
    const useMock = process.env.USE_MOCK === 'true';

    // We keep emmy_winners as mock for now
    if (useMock || shelfId === 'emmy_winners') {
        return generateMockItems(10, 'tv');
    }

    try {
        let endpoint = '';
        switch (shelfId) {
            case 'trending_tv':
                endpoint = '/trending/tv/week';
                break;
            case 'anticipated_tv':
                endpoint = '/tv/on_the_air';
                break;
            case 'imdb_top_250_tv':
                endpoint = '/tv/top_rated';
                break;
            default:
                return []; // Unknown shelf
        }

        const data = await fetchTMDB<TMDBListResponse>(endpoint);

        return data.results.slice(0, 10).map(tv => ({
            id: String(tv.id),
            title: tv.name,
            posterUrl: tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : '',
            rating: parseFloat(tv.vote_average.toFixed(1)),
            year: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : 0,
        }));
    } catch (error) {
        console.error(`Failed to fetch explore TV shows for shelf ${shelfId}:`, error);
        return [];
    }
}
