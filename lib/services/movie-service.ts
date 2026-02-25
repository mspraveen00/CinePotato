
// I need to import the RAW fetcher from lib/api/tmdb
import { fetchTMDB } from '@/lib/api/tmdb';
import { TitleDetail, CastMember } from '@/types/title';
import { generateMockDetail, generateMockItems } from '@/lib/mock-data';

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

interface TMDBCastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

interface TMDBCreditsResponse {
    cast: TMDBCastMember[];
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

        // 1. Fetch Movie Details with Images via append_to_response
        const movie = await fetchTMDB<TMDBMovie & { images: TMDBImagesResponse, credits: TMDBCreditsResponse }>(`/movie/${id}?append_to_response=images,credits`);
        const images = movie.images || { backdrops: [], logos: [], posters: [] };

        // 2. Logo Logic
        const logos: string[] = [];

        const getBestLogo = (lang: string | null) => {
            const matches = images.logos.filter(l => l.iso_639_1 === lang);
            if (matches.length === 0) return null;
            // Sort by vote average, then width
            matches.sort((a, b) => {
                if (b.vote_average !== a.vote_average) return b.vote_average - a.vote_average;
                return b.width - a.width;
            });
            return matches[0];
        };

        const origLang = movie.original_language;
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
            // Found original language logo, add 1 English logo if available
            if (englishLogos.length > 0) {
                logos.push(`https://image.tmdb.org/t/p/original${englishLogos[0].file_path}`);
            }
        } else {
            // No original language logo found, return up to 2 English logos
            englishLogos.slice(0, 2).forEach(logo => {
                logos.push(`https://image.tmdb.org/t/p/original${logo.file_path}`);
            });
        }

        // 3. Backdrop Logic
        const topBackdrops = images.backdrops
            .sort((a, b) => b.vote_average - a.vote_average)
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 20)
            .map(b => `https://image.tmdb.org/t/p/original${b.file_path}`);

        if (topBackdrops.length === 0 && movie.backdrop_path) {
            topBackdrops.push(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`);
        }

        // 4. Cast Logic
        const castMembers: CastMember[] = (movie.credits?.cast || [])
            .sort((a, b) => a.order - b.order)
            .slice(0, 10)
            .map(actor => ({
                id: actor.id,
                name: actor.name,
                character: actor.character,
                profileImageUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : null,
            }));

        // 5. Transform to Domain Model
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
            logos: logos.length > 0 ? logos : undefined,
            cast: castMembers,
        };

    } catch (error) {
        console.error(`Failed to fetch movie details for ID ${id}:`, error);
        return null;
    }
}

// -----------------------------------------------------------------------------
// Explore Shelf Data Fetching
// -----------------------------------------------------------------------------

import { ExploreItem } from '@/lib/constants/explore';

interface TMDBListResponse {
    results: TMDBMovie[];
}

export async function getExploreMovies(shelfId: string, limit: number = 10): Promise<ExploreItem[]> {
    const useMock = process.env.USE_MOCK === 'true';

    // We keep best_picture as mock for now as requested
    if (useMock || shelfId === 'best_picture') {
        return generateMockItems(limit, "movies");
    }

    try {
        let endpoint = '';
        switch (shelfId) {
            case 'trending_movies':
                endpoint = '/trending/movie/week';
                break;
            case 'anticipated_movies':
                endpoint = '/movie/upcoming';
                break;
            case 'imdb_top_250_movies':
                endpoint = '/movie/top_rated';
                break;
            case 'box_office':
                endpoint = '/discover/movie?sort_by=revenue.desc';
                break;
            default:
                return []; // Unknown shelf
        }

        const data = await fetchTMDB<TMDBListResponse>(endpoint);

        return data.results.slice(0, limit).map(movie => ({
            id: String(movie.id),
            title: movie.title,
            posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
            rating: parseFloat(movie.vote_average.toFixed(1)),
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
        }));
    } catch (error) {
        console.error(`Failed to fetch explore movies for shelf ${shelfId}:`, error);
        return [];
    }
}
