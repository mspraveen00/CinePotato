import { fetchTMDB } from '@/lib/api/tmdb';
import { TitleDetail, CastMember, CrewMember } from '@/types/title';
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
    created_by: {
        id: number;
        name: string;
        profile_path: string | null;
    }[];
    seasons: {
        id: number;
        name: string;
        season_number: number;
        episode_count: number;
        air_date: string | null;
        poster_path: string | null;
        overview: string;
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

export async function getTVDetail(id: string): Promise<TitleDetail | null> {
    const useMock = process.env.USE_MOCK === 'true';

    if (useMock) {
        console.log(`[Mock Mode] Fetching TV details for ID: ${id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateMockTVDetail(id);
    }

    try {
        console.log(`[Real Mode] Fetching TV Data for ID: ${id}`);

        const tv = await fetchTMDB<TMDBTVShow & { images: TMDBImagesResponse, credits: TMDBCreditsResponse, episode_groups: { results: TMDBEpisodeGroupList[] } }>(`/tv/${id}?append_to_response=images,credits,episode_groups`);
        const images = tv.images || { backdrops: [], logos: [], posters: [] };

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

        // Poster Logic
        const topPosters: string[] = [];

        // Always start with the primary poster if it exists
        if (tv.poster_path) {
            topPosters.push(`https://image.tmdb.org/t/p/w500${tv.poster_path}`);
        }

        // Filter available posters:
        // 1. Match original language
        // 2. English ('en')
        // 3. No language (null)
        const validLanguages = [tv.original_language, 'en', null];

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

        // Cast Logic
        const castMembers: CastMember[] = (tv.credits?.cast || [])
            .sort((a, b) => a.order - b.order)
            .slice(0, 10)
            .map(actor => ({
                id: actor.id,
                name: actor.name,
                character: actor.character,
                profileImageUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : null,
            }));

        // 5. Crew Logic
        // For TV shows, 'created_by' is often the most important "crew" member.
        const crewMap = new Map<number, CrewMember & { jobs: Set<string> }>();

        // Add Creators first
        if (tv.created_by) {
            tv.created_by.forEach(creator => {
                crewMap.set(creator.id, {
                    id: creator.id,
                    name: creator.name,
                    job: 'Creator', // Temporary, will be joined later
                    jobs: new Set(['Creator']),
                    profileImageUrl: creator.profile_path ? `https://image.tmdb.org/t/p/w500${creator.profile_path}` : null,
                });
            });
        }

        // Add other important crew
        const topJobs = ['Executive Producer', 'Series Director', 'Director', 'Writer', 'Director of Photography', 'Original Music Composer'];

        const filteredCrew = (tv.credits?.crew || []).filter(c => topJobs.includes(c.job));

        filteredCrew.forEach(c => {
            if (!crewMap.has(c.id)) {
                crewMap.set(c.id, {
                    id: c.id,
                    name: c.name,
                    job: c.job, // Temp
                    jobs: new Set([c.job]),
                    profileImageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w500${c.profile_path}` : null,
                });
            } else {
                crewMap.get(c.id)!.jobs.add(c.job);
            }
        });

        const crewMembers: CrewMember[] = Array.from(crewMap.values())
            .sort((a, b) => {
                // Prioritize Creators & Executive Producers
                const aIdx = a.jobs.has('Creator') ? 2 : a.jobs.has('Executive Producer') ? 1 : 0;
                const bIdx = b.jobs.has('Creator') ? 2 : b.jobs.has('Executive Producer') ? 1 : 0;
                if (aIdx !== bIdx) return bIdx - aIdx;
                return 0;
            })
            .slice(0, 10)
            .map(c => ({
                id: c.id,
                name: c.name,
                job: Array.from(c.jobs).join(', '),
                profileImageUrl: c.profileImageUrl,
            }));

        const mappedSeasons = (tv.seasons || [])
            .map(s => ({
                id: s.id,
                name: s.name,
                seasonNumber: s.season_number,
                episodeCount: s.episode_count,
                airDate: s.air_date,
                posterPath: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
                overview: s.overview,
            }))
            .sort((a, b) => a.seasonNumber - b.seasonNumber);

        const mappedEpisodeGroups = (tv.episode_groups?.results || [])
            .map(eg => ({
                id: eg.id,
                name: eg.name,
                description: eg.description,
                episodeCount: eg.episode_count,
                groupCount: eg.group_count,
                network: eg.network?.name || null,
                type: eg.type,
            }));

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
            posters: topPosters.length > 0 ? topPosters : undefined,
            cast: castMembers,
            crew: crewMembers,
            seasons: mappedSeasons.length > 0 ? mappedSeasons : undefined,
            episodeGroups: mappedEpisodeGroups.length > 0 ? mappedEpisodeGroups : undefined,
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

export async function getExploreTVs(shelfId: string, limit: number = 10): Promise<ExploreItem[]> {
    const useMock = process.env.USE_MOCK === 'true';

    // We keep emmy_winners as mock for now
    if (useMock || shelfId === 'emmy_winners') {
        return generateMockItems(limit, 'tv');
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

        return data.results.slice(0, limit).map(tv => ({
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

// -----------------------------------------------------------------------------
// Season Detail Fetching
// -----------------------------------------------------------------------------

import { Episode } from '@/types/title';

interface TMDBEpisode {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    air_date: string | null;
    episode_number: number;
    season_number: number;
    runtime: number | null;
    still_path: string | null;
}

interface TMDBSeasonResponse {
    _id: string;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episodes: TMDBEpisode[];
}

export async function getSeasonDetail(tvId: string, seasonNumber: number): Promise<Episode[]> {
    const useMock = process.env.USE_MOCK === 'true';

    if (useMock) {
        // Return mostly empty array for mock mode to prevent layout breaks
        console.log(`[Mock Mode] Fetching season details for TV ID: ${tvId}, Season: ${seasonNumber}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        return [];
    }

    try {
        console.log(`[Real Mode] Fetching Season Data for TV ID: ${tvId}, Season: ${seasonNumber}`);
        const data = await fetchTMDB<TMDBSeasonResponse>(`/tv/${tvId}/season/${seasonNumber}`);

        return (data.episodes || []).map(ep => ({
            id: ep.id,
            name: ep.name,
            episodeNumber: ep.episode_number,
            seasonNumber: ep.season_number,
            overview: ep.overview,
            airDate: ep.air_date,
            runtime: ep.runtime,
            stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
            rating: parseFloat(ep.vote_average.toFixed(1))
        }));
    } catch (error) {
        console.error(`Failed to fetch season details for TV ID: ${tvId}, Season: ${seasonNumber}:`, error);
        return [];
    }
}

// -----------------------------------------------------------------------------
// Episode Group Detail Fetching
// -----------------------------------------------------------------------------

interface TMDBEpisodeGroupList {
    id: string;
    name: string;
    description: string;
    episode_count: number;
    group_count: number;
    network: {
        id: number;
        name: string;
    } | null;
    type: number;
}

export interface EpisodeGroupDetail {
    id: string;
    name: string;
    description: string;
    episodeCount: number;
    groupCount: number;
    network: string | null;
    type: number;
    groups: {
        id: string;
        name: string;
        order: number;
        episodes: Episode[];
    }[];
}

interface TMDBEpisodeGroupDetail {
    id: string;
    name: string;
    description: string;
    episode_count: number;
    group_count: number;
    network: {
        id: number;
        name: string;
    } | null;
    type: number;
    groups: {
        id: string;
        name: string;
        order: number;
        episodes: TMDBEpisode[];
        locked: boolean;
    }[];
}

export async function getEpisodeGroupDetail(groupId: string): Promise<EpisodeGroupDetail | null> {
    const useMock = process.env.USE_MOCK === 'true';

    if (useMock) {
        console.log(`[Mock Mode] Fetching episode group details for ID: ${groupId}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        return null;
    }

    try {
        console.log(`[Real Mode] Fetching Episode Group Data for ID: ${groupId}`);
        const data = await fetchTMDB<TMDBEpisodeGroupDetail>(`/tv/episode_group/${groupId}`);

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            episodeCount: data.episode_count,
            groupCount: data.group_count,
            network: data.network?.name || null,
            type: data.type,
            groups: (data.groups || []).map(g => ({
                id: g.id,
                name: g.name,
                order: g.order,
                episodes: (g.episodes || []).map(ep => ({
                    id: ep.id,
                    name: ep.name,
                    episodeNumber: ep.episode_number,
                    seasonNumber: ep.season_number,
                    overview: ep.overview,
                    airDate: ep.air_date,
                    runtime: ep.runtime,
                    stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
                    rating: parseFloat((ep.vote_average || 0).toFixed(1))
                }))
            }))
        };
    } catch (error) {
        console.error(`Failed to fetch episode group details for ID: ${groupId}:`, error);
        return null;
    }
}
