
import { TitleDetail } from '@/types/title';

const TMDB_API_URL = 'https://api.themoviedb.org/3';

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

export async function fetchTMDB<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token) {
        throw new Error("Missing TMDB_READ_ACCESS_TOKEN");
    }

    const url = `${TMDB_API_URL}${path}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
        next: { revalidate: 3600, ...options.next },
    });

    if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function getMovieDetail(id: string): Promise<TitleDetail | null> {
    try {
        // 1. Fetch Movie Details and Images in Parallel
        // If images fail, we catch efficiently to ensure we still return movie data
        const moviePromise = fetchTMDB<TMDBMovie>(`/movie/${id}`);
        const imagesPromise = fetchTMDB<TMDBImagesResponse>(`/movie/${id}/images`).catch(error => {
            console.error("Failed to fetch TMDB images:", error);
            return { backdrops: [], logos: [], posters: [] } as TMDBImagesResponse;
        });

        const [movie, images] = await Promise.all([moviePromise, imagesPromise]);

        // 2. Logo Logic
        // Filter for English or language-neutral logos
        const validLogos = images.logos.filter(
            l => l.iso_639_1 === 'en' || l.iso_639_1 === null
        );

        // Sort by vote_average desc, then by width desc (for highest resolution)
        validLogos.sort((a, b) => {
            if (b.vote_average !== a.vote_average) {
                return b.vote_average - a.vote_average;
            }
            return b.width - a.width;
        });

        const bestLogo = validLogos.length > 0 ? validLogos[0] : null;

        // 3. Backdrop Logic
        // Sort by vote average to get best quality backdrops
        const topBackdrops = images.backdrops
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 5)
            .map(b => `https://image.tmdb.org/t/p/original${b.file_path}`);

        // Fallback if no backdrops found in images endpoint
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
                : "", // Handle missing poster
            releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
            runtime: movie.runtime
                ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
                : "N/A",
            genres: movie.genres.map(g => g.name),
            rating: parseFloat(movie.vote_average.toFixed(1)),
            logos: bestLogo
                ? [`https://image.tmdb.org/t/p/original${bestLogo.file_path}`]
                : undefined, // undefined triggers text title fallback
        };

    } catch (error) {
        console.error(`Failed to fetch movie details for ID ${id}:`, error);
        // Return null so the page can handle the specific error (e.g. 404 Not Found)
        return null;
    }
}
