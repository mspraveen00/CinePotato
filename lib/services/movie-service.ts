import { fetchTMDB } from '@/lib/api/tmdb';
import { fetchOMDb } from '@/lib/api/omdb';
import { TitleDetail, CastMember, CrewMember, OMDbRatings, TrailerVideo, CollectionInfo } from '@/types/title';
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
    imdb_id: string | null;
    tagline: string | null;
    belongs_to_collection: {
        id: number;
        name: string;
        poster_path: string | null;
        backdrop_path: string | null;
    } | null;
}

interface TMDBVideoResult {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
    published_at: string;
}

interface TMDBVideosResponse {
    results: TMDBVideoResult[];
}

interface TMDBReleaseDateEntry {
    certification: string;
    type: number; // 1=Premiere, 2=Limited, 3=Theatrical, 4=Digital, 5=Physical, 6=TV
    release_date: string;
}

interface TMDBReleaseDatesResponse {
    results: {
        iso_3166_1: string;
        release_dates: TMDBReleaseDateEntry[];
    }[];
}

interface TMDBCollectionResponse {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    parts: {
        id: number;
        title: string;
        poster_path: string | null;
        release_date: string | null;
        overview: string;
        vote_average: number;
    }[];
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

interface TMDBCrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

interface TMDBCreditsResponse {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
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

        // 1. Fetch Movie Details with Images, Credits, Videos, and Release Dates via append_to_response
        const movie = await fetchTMDB<TMDBMovie & {
            images: TMDBImagesResponse,
            credits: TMDBCreditsResponse,
            videos: TMDBVideosResponse,
            release_dates: TMDBReleaseDatesResponse
        }>(`/movie/${id}?append_to_response=images,credits,videos,release_dates`);
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

        // 2.5 Poster Logic
        const topPosters: string[] = [];

        // Always start with the primary poster if it exists
        if (movie.poster_path) {
            topPosters.push(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
        }

        // Filter available posters:
        // 1. Match original language
        // 2. English ('en')
        // 3. No language (null)
        const validLanguages = [movie.original_language, 'en', null];

        const additionalPosters = images.posters
            .filter(p => validLanguages.includes(p.iso_639_1))       // Language filter
            .filter(p => !topPosters.some(existing => existing.includes(p.file_path))) // Prevent duplicates
            .sort((a, b) => {
                // Secondary sort: vote count (to filter out random 10/10s with 1 vote)
                if (b.vote_average !== a.vote_average) return b.vote_average - a.vote_average;
                return b.vote_count - a.vote_count;
            })
            .slice(0, 3 - topPosters.length) // Take only what we need to reach 3 max
            .map(p => `https://image.tmdb.org/t/p/w500${p.file_path}`);

        topPosters.push(...additionalPosters);

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

        // 5. Crew Logic
        const topJobs = ['Director', 'Screenplay', 'Writer', 'Story', 'Director of Photography', 'Original Music Composer', 'Editor', 'Producer'];

        const filteredCrew = (movie.credits?.crew || []).filter(c => topJobs.includes(c.job));

        // Deduplicate by ID and combine jobs
        const crewMap = new Map<number, TMDBCrewMember & { jobs: Set<string> }>();
        filteredCrew.forEach(c => {
            if (!crewMap.has(c.id)) {
                crewMap.set(c.id, { ...c, jobs: new Set([c.job]) });
            } else {
                crewMap.get(c.id)!.jobs.add(c.job);
            }
        });

        // Convert map back to array, sort by job priority (roughly), and take top 10
        const crewMembers: CrewMember[] = Array.from(crewMap.values())
            .sort((a, b) => {
                // Prioritize Directors
                const aIsDir = a.jobs.has('Director') ? 1 : 0;
                const bIsDir = b.jobs.has('Director') ? 1 : 0;
                if (aIsDir !== bIsDir) return bIsDir - aIsDir;
                // Otherwise fallback to whatever came first in TMDB's array
                return 0;
            })
            .slice(0, 10)
            .map(c => ({
                id: c.id,
                name: c.name,
                job: Array.from(c.jobs).join(', '),
                profileImageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w500${c.profile_path}` : null,
            }));

        // 6. OMDb Ratings Logic
        let omdbRatings: OMDbRatings | undefined;
        if (movie.imdb_id) {
            try {
                const omdbData = await fetchOMDb<any>({ i: movie.imdb_id, tomatoes: 'true' });
                if (omdbData && omdbData.Response === 'True') {
                    omdbRatings = {};
                    if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
                        omdbRatings.imdb = omdbData.imdbRating;
                    }
                    if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
                        omdbRatings.metacritic = omdbData.Metascore;
                    }
                    if (omdbData.Ratings && Array.isArray(omdbData.Ratings)) {
                        const rottenTomatoes = omdbData.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes');
                        if (rottenTomatoes && rottenTomatoes.Value) {
                            omdbRatings.rottenTomatoes = rottenTomatoes.Value;
                        }
                    }
                    if (omdbData.tomatoURL && omdbData.tomatoURL !== 'N/A') {
                        omdbRatings.rottenTomatoesUrl = omdbData.tomatoURL;
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch OMDb ratings for IMDb ID ${movie.imdb_id}:`, error);
            }
        }

        // 7. Trailer Logic — prioritize official YouTube trailers, then teasers, then clips
        const trailerTypeOrder = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes'];
        const trailers: TrailerVideo[] = (movie.videos?.results || [])
            .filter(v => v.site === 'YouTube')
            .sort((a, b) => {
                // Official first
                if (a.official !== b.official) return a.official ? -1 : 1;
                // Then by type priority
                const aIdx = trailerTypeOrder.indexOf(a.type);
                const bIdx = trailerTypeOrder.indexOf(b.type);
                const aPriority = aIdx === -1 ? 999 : aIdx;
                const bPriority = bIdx === -1 ? 999 : bIdx;
                if (aPriority !== bPriority) return aPriority - bPriority;
                // Newer first
                return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
            })
            .slice(0, 5)
            .map(v => ({
                id: v.id,
                key: v.key,
                name: v.name,
                site: v.site,
                type: v.type,
                official: v.official,
            }));

        // 8. Certification Logic — get US rating, fallback to IN, then GB
        let certification: string | undefined;
        const certPriorityCountries = ['US', 'IN', 'GB', 'AU', 'CA'];
        const releaseDatesResults = movie.release_dates?.results || [];

        for (const country of certPriorityCountries) {
            if (certification) break;
            const countryData = releaseDatesResults.find(r => r.iso_3166_1 === country);
            if (countryData) {
                // Prefer theatrical (type 3), then any with a certification
                const theatrical = countryData.release_dates.find(rd => rd.type === 3 && rd.certification);
                const anyWithCert = countryData.release_dates.find(rd => rd.certification);
                const entry = theatrical || anyWithCert;
                if (entry?.certification) {
                    certification = entry.certification;
                }
            }
        }

        // 9. Collection/Franchise Logic
        let collection: CollectionInfo | undefined;
        if (movie.belongs_to_collection) {
            try {
                const collectionData = await fetchTMDB<TMDBCollectionResponse>(
                    `/collection/${movie.belongs_to_collection.id}`
                );
                collection = {
                    id: collectionData.id,
                    name: collectionData.name,
                    posterPath: collectionData.poster_path
                        ? `https://image.tmdb.org/t/p/w500${collectionData.poster_path}`
                        : null,
                    backdropPath: collectionData.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${collectionData.backdrop_path}`
                        : null,
                    parts: collectionData.parts
                        .sort((a, b) => {
                            // Sort by release date ascending
                            if (!a.release_date) return 1;
                            if (!b.release_date) return -1;
                            return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
                        })
                        .map(p => ({
                            id: p.id,
                            title: p.title,
                            posterPath: p.poster_path
                                ? `https://image.tmdb.org/t/p/w500${p.poster_path}`
                                : null,
                            releaseDate: p.release_date,
                            overview: p.overview,
                            rating: parseFloat(p.vote_average.toFixed(1)),
                        })),
                };
            } catch (collError) {
                console.error(`Failed to fetch collection for movie ${id}:`, collError);
            }
        }

        // 10. Transform to Domain Model
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
            posters: topPosters.length > 0 ? topPosters : undefined,
            cast: castMembers,
            crew: crewMembers,
            omdbRatings,
            imdbId: movie.imdb_id || undefined,
            mediaType: 'movie',
            trailers: trailers.length > 0 ? trailers : undefined,
            certification,
            collection,
            tagline: movie.tagline || undefined,
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
