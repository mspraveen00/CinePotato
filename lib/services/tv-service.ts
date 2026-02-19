import { fetchTMDB } from '@/lib/api/tmdb';
import { TitleDetail } from '@/types/title';
import { generateMockTVDetail } from '@/lib/mock-data';

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
        const validLogos = images.logos.filter(
            l => l.iso_639_1 === 'en' || l.iso_639_1 === null
        );

        validLogos.sort((a, b) => {
            if (b.vote_average !== a.vote_average) {
                return b.vote_average - a.vote_average;
            }
            return b.width - a.width;
        });

        const bestLogo = validLogos.length > 0 ? validLogos[0] : null;

        // Backdrop Logic
        const topBackdrops = images.backdrops
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 5)
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
            logoPath: bestLogo
                ? `https://image.tmdb.org/t/p/original${bestLogo.file_path}`
                : undefined,
        };

    } catch (error) {
        console.error(`Failed to fetch TV details for ID ${id}:`, error);
        return null;
    }
}
