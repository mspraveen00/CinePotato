import { SearchResult } from '@/types/search';

interface IGDBGame {
    id: number;
    name: string;
    cover?: {
        image_id: string;
    };
    first_release_date?: number; // Unix timestamp
    summary?: string;
    total_rating?: number;
    total_rating_count?: number;
}

export async function searchGames(query: string): Promise<SearchResult[]> {
    try {
        // IGDB Query Language (Apicalypse)
        // We need name, cover.image_id, release date, summary, rating
        // "search" is used for text search
        const body = `
            search "${query}";
            fields name, cover.image_id, first_release_date, summary, total_rating, total_rating_count;
            limit 20;
        `;

        const res = await fetch('/api/igdb/games', {
            method: 'POST',
            body: body,
        });

        if (!res.ok) {
            let errorMessage = `IGDB Search Error: ${res.status}`;
            try {
                const errorData = await res.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // Ignore
            }
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const data: IGDBGame[] = await res.json();

        return data.map(game => {
            const imageId = game.cover?.image_id;
            const releaseDate = game.first_release_date
                ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
                : undefined;

            return {
                id: String(game.id),
                title: game.name,
                mediaType: 'game',
                posterPath: imageId
                    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`
                    : undefined,
                releaseDate: releaseDate,
                overview: game.summary,
                rating: game.total_rating ? parseFloat((game.total_rating / 10).toFixed(1)) : 0, // 0-100 to 0-10
                voteCount: game.total_rating_count,
            };
        });

    } catch (error: any) {
        console.error("Game Search Service Error:", error);
        throw new Error(error.message || "Failed to fetch game results");
    }
}
