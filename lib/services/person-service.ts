import { fetchTMDB } from '@/lib/api/tmdb';
import { TitleDetail, KnownForCredit } from '@/types/title';
import { generateMockPersonDetail } from '@/lib/mock-data';

interface TMDBPerson {
    id: number;
    name: string;
    biography: string;
    birthday: string;
    deathday: string | null;
    place_of_birth: string;
    profile_path: string;
    known_for_department: string;
    popularity: number;
}

interface TMDBImage {
    file_path: string;
    width: number;
    height: number;
    vote_average: number;
}

interface TMDBPersonImages {
    profiles: TMDBImage[];
}

interface TMDBCombinedCreditCast {
    id: number;
    title?: string;
    name?: string;
    media_type: 'movie' | 'tv';
    poster_path: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    character?: string;
    order?: number;
    release_date?: string;
    first_air_date?: string;
    episode_count?: number;
}

interface TMDBCombinedCreditCrew {
    id: number;
    title?: string;
    name?: string;
    media_type: 'movie' | 'tv';
    poster_path: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    job?: string;
    department?: string;
    release_date?: string;
    first_air_date?: string;
    episode_count?: number;
}

interface TMDBPersonCombinedCredits {
    cast: TMDBCombinedCreditCast[];
    crew: TMDBCombinedCreditCrew[];
}

function extractKnownForCredits(department: string, credits: TMDBPersonCombinedCredits): KnownForCredit[] {
    const candidates: (KnownForCredit & { score: number })[] = [];

    const processCast = (c: TMDBCombinedCreditCast) => {
        if (!c.poster_path) return;
        const voteCount = c.vote_count || 0;
        const popularity = c.popularity || 0;
        const order = typeof c.order === 'number' ? c.order : 1;

        let weight = 0.05;
        if (order === 0) weight = 1.0;
        else if (order === 1) weight = 0.85;
        else if (order === 2) weight = 0.7;
        else if (order <= 5) weight = 0.4;
        else if (order <= 10) weight = 0.15;

        if (c.character && c.character.toLowerCase().includes('uncredited')) {
            weight *= 0.1;
        }

        const score = (voteCount + popularity * 10) * weight;
        const rawDate = c.release_date || c.first_air_date;
        const year = rawDate ? new Date(rawDate).getFullYear() : undefined;

        candidates.push({
            id: String(c.id),
            title: c.title || c.name || 'Untitled',
            posterUrl: `https://image.tmdb.org/t/p/w500${c.poster_path}`,
            mediaType: c.media_type || 'movie',
            year: year && !isNaN(year) ? year : undefined,
            rating: c.vote_average ? Number(c.vote_average.toFixed(1)) : 0,
            role: c.character || 'Self',
            voteCount,
            score,
        });
    };

    const processCrew = (c: TMDBCombinedCreditCrew) => {
        if (!c.poster_path) return;
        const voteCount = c.vote_count || 0;
        const popularity = c.popularity || 0;

        let weight = 0.1;
        if (c.department === department) weight = 1.0;
        else if (c.job === 'Director') weight = 0.9;
        else if (c.job === 'Writer' || c.job === 'Screenplay') weight = 0.8;
        else if (c.job === 'Producer') weight = 0.6;

        const score = (voteCount + popularity * 10) * weight;
        const rawDate = c.release_date || c.first_air_date;
        const year = rawDate ? new Date(rawDate).getFullYear() : undefined;

        candidates.push({
            id: String(c.id),
            title: c.title || c.name || 'Untitled',
            posterUrl: `https://image.tmdb.org/t/p/w500${c.poster_path}`,
            mediaType: c.media_type || 'movie',
            year: year && !isNaN(year) ? year : undefined,
            rating: c.vote_average ? Number(c.vote_average.toFixed(1)) : 0,
            role: c.job || c.department || 'Crew',
            voteCount,
            score,
        });
    };

    if (department === 'Acting') {
        (credits.cast || []).forEach(processCast);
        if (candidates.length < 5) {
            (credits.crew || []).forEach(processCrew);
        }
    } else {
        (credits.crew || []).forEach(processCrew);
        if (candidates.length < 5) {
            (credits.cast || []).forEach(processCast);
        }
    }

    // Deduplicate by mediaType-id
    const seen = new Set<string>();
    const sorted = candidates.sort((a, b) => b.score - a.score);
    const result: KnownForCredit[] = [];
    for (const item of sorted) {
        const key = `${item.mediaType}-${item.id}`;
        if (!seen.has(key)) {
            seen.add(key);
            const { score, ...credit } = item;
            result.push(credit);
        }
    }

    return result.slice(0, 20);
}

export async function getPersonDetail(id: string): Promise<TitleDetail | null> {
    const useMock = process.env.USE_MOCK === 'true';

    if (useMock) {
        console.log(`[Mock Mode] Fetching Person details for ID: ${id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateMockPersonDetail(id);
    }

    try {
        console.log(`[Real Mode] Fetching Person Data for ID: ${id}`);

        const personPromise = fetchTMDB<TMDBPerson>(`/person/${id}`);
        const imagesPromise = fetchTMDB<TMDBPersonImages>(`/person/${id}/images`).catch(error => {
            console.error("Failed to fetch TMDB person images:", error);
            return { profiles: [] } as TMDBPersonImages;
        });
        const creditsPromise = fetchTMDB<TMDBPersonCombinedCredits>(`/person/${id}/combined_credits`).catch(error => {
            console.error("Failed to fetch TMDB person combined credits:", error);
            return { cast: [], crew: [] } as TMDBPersonCombinedCredits;
        });

        const [person, images, credits] = await Promise.all([personPromise, imagesPromise, creditsPromise]);

        // Use profiles as "backdrops" or just stick to profile_path? 
        // TitleDetail expects backdropImages. We can put some profile shots there.
        const topProfiles = images.profiles
            .slice(0, 5)
            .map(b => `https://image.tmdb.org/t/p/original${b.file_path}`);

        const knownFor = extractKnownForCredits(person.known_for_department, credits);

        return {
            id: String(person.id),
            title: person.name, // Map name to title
            overview: person.biography,
            backdropImages: topProfiles,
            posterPath: person.profile_path
                ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                : "",
            releaseYear: person.birthday ? new Date(person.birthday).getFullYear() : 0, // Birth year
            runtime: "N/A",
            genres: [person.known_for_department], // Map department to genre
            rating: 0, // Persons don't have vote_average usually, or we could use popularity?
            knownFor,
        };

    } catch (error) {
        console.error(`Failed to fetch Person details for ID ${id}:`, error);
        return null;
    }
}

