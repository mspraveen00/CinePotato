
// I need to import the RAW fetcher from lib/api/tmdb
import { fetchTMDB } from '@/lib/api/tmdb';
import { TitleDetail } from '@/types/title';
import { generateMockDetail } from '@/lib/mock-data';

interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    runtime: number;
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

export async function getMovieDetail(id: string): Promise<TitleDetail | null> {
    const useMock = process.env.USE_MOCK === 'true';

    if (useMock) {
        console.log(`[Mock Mode] Fetching movie details for ID: ${id}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateMockDetail(id);
    }

    try {
        console.log(`[Real Mode] Fetching Data for ID: ${id}`);

        // 1. Fetch Movie Details and Images in Parallel
        const moviePromise = fetchTMDB<TMDBMovie>(`/movie/${id}`);
        const imagesPromise = fetchTMDB<TMDBImagesResponse>(`/movie/${id}/images`).catch(error => {
            console.error("Failed to fetch TMDB images:", error);
            return { backdrops: [], logos: [], posters: [] } as TMDBImagesResponse;
        });

        const [movie, images] = await Promise.all([moviePromise, imagesPromise]);

        // 2. Logo Logic
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

        // 3. Backdrop Logic
        const topBackdrops = images.backdrops
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 5)
            .map(b => `https://image.tmdb.org/t/p/original${b.file_path}`);

        if (topBackdrops.length === 0 && movie.backdrop_path) {
            topBackdrops.push(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`);
        }

        // 4. Transform to Domain Model
        return {
            id: String(movie.id),
            title: movie.title,
            overview: movie.overview,
            backdropImages: topBackdrops,
            posterPath: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "",
            releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
            runtime: movie.runtime
                ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
                : "N/A",
            genres: movie.genres.map(g => g.name),
            rating: parseFloat(movie.vote_average.toFixed(1)),
            logoPath: bestLogo
                ? `https://image.tmdb.org/t/p/original${bestLogo.file_path}`
                : undefined,
        };

    } catch (error) {
        console.error(`Failed to fetch movie details for ID ${id}:`, error);
        return null;
    }
}
