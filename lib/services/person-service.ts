import { fetchTMDB } from '@/lib/api/tmdb';
import { TitleDetail } from '@/types/title';
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

        const [person, images] = await Promise.all([personPromise, imagesPromise]);

        // Use profiles as "backdrops" or just stick to profile_path? 
        // TitleDetail expects backdropImages. We can put some profile shots there.
        const topProfiles = images.profiles
            .slice(0, 5)
            .map(b => `https://image.tmdb.org/t/p/original${b.file_path}`);

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
            logoPath: undefined,
        };

    } catch (error) {
        console.error(`Failed to fetch Person details for ID ${id}:`, error);
        return null;
    }
}
