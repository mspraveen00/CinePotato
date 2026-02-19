import { SearchResult, MediaType } from '@/types/search';
import { generateMockItems } from '@/lib/mock-data';
import { searchGames } from '@/lib/services/game-search-service';

interface TMDBSearchResult {
    id: number;
    title?: string;
    original_title?: string;
    name?: string; // For TV/Person
    original_name?: string;
    media_type: string;
    poster_path?: string;
    profile_path?: string; // For Person
    backdrop_path?: string;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
}

interface TMDBSearchResponse {
    page: number;
    results: TMDBSearchResult[];
    total_pages: number;
    total_results: number;
}

export async function searchTitles(query: string, type?: MediaType): Promise<SearchResult[]> {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

    if (useMock) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const results: SearchResult[] = [];

        if (!type || type === 'movie') {
            const mockMovies = generateMockItems(4, "movies");
            results.push(...mockMovies.map(item => ({
                id: item.id,
                title: item.title,
                mediaType: 'movie' as MediaType,
                rating: item.rating,
                releaseDate: `${item.year}-01-01`,
                posterPath: item.posterUrl,
                overview: "Mock overview for search result."
            })));
        }

        if (!type || type === 'tv') {
            const mockTV = generateMockItems(4, "tv");
            results.push(...mockTV.map(item => ({
                id: item.id,
                title: item.title,
                mediaType: 'tv' as MediaType,
                rating: item.rating,
                releaseDate: `${item.year}-01-01`,
                posterPath: item.posterUrl,
                overview: "Mock overview for TV result."
            })));
        }

        if (!type || type === 'person') {
            const mockPersons = [1, 2, 3].map(i => ({
                id: `person-${i}`,
                title: `Mock Person ${i}`,
                mediaType: 'person' as MediaType,
                rating: 0,
                posterPath: "",
                overview: "Mock person biography."
            }));
            results.push(...mockPersons);
        }

        if (!type || type === 'game') {
            const mockGames = generateMockItems(4, "games");
            results.push(...mockGames.map(item => ({
                id: item.id,
                title: item.title,
                mediaType: 'game' as MediaType,
                rating: item.rating,
                releaseDate: `${item.year}-01-01`,
                posterPath: item.posterUrl,
                overview: "Mock overview for game result."
            })));
        }

        return results;
    }

    try {
        if (type === 'game') {
            return await searchGames(query);
        }

        // Call the server-side proxy for TMDB multi-search (movies, tv, person)
        // If specific type is requested (movie/tv/person), we could use specific endpoints, 
        // but multi-search + filter is often easier unless pagination is strict.
        // For now, let's stick to multi-search and filter if needed, OR just return all for 'multi'.
        const res = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);

        if (!res.ok) {
            let errorMessage = `Search API Error: ${res.status}`;
            try {
                const errorData = await res.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // Ignore if not JSON
            }
            throw new Error(errorMessage);
        }

        const data: TMDBSearchResponse = await res.json();

        return data.results
            .filter(item => {
                const mediaType = item.media_type as MediaType;
                if (type && type !== mediaType) return false; // Basic filtering if type is specified
                return item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person';
            })
            .map(item => {
                const title = item.title || item.name || "Unknown Title";
                const date = item.release_date || item.first_air_date;
                const mediaType = (item.media_type as MediaType) || 'movie';

                // Use profile_path for person, poster_path for others
                const imagePath = mediaType === 'person' ? item.profile_path : item.poster_path;

                return {
                    id: String(item.id),
                    title: title,
                    originalTitle: item.original_title || item.original_name,
                    mediaType: mediaType,
                    posterPath: imagePath
                        ? `https://image.tmdb.org/t/p/w500${imagePath}`
                        : undefined,
                    backdropPath: item.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
                        : undefined,
                    releaseDate: date,
                    overview: item.overview,
                    rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
                    voteCount: item.vote_count,
                    popularity: item.popularity,
                    genreIds: item.genre_ids
                };
            });

    } catch (error: any) {
        console.error("Search Service Error:", error);
        throw new Error(error.message || "Failed to fetch search results");
    }
}
