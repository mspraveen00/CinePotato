"use server";

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

        const { fetchIGDB } = await import('@/lib/api/igdb');
        const data: IGDBGame[] = await fetchIGDB('games', body);

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

// -----------------------------------------------------------------------------
// Explore Shelf Data Fetching
// -----------------------------------------------------------------------------

import { ExploreItem } from '@/lib/constants/explore';

export async function getExploreGames(shelfId: string, limit: number = 10): Promise<ExploreItem[]> {
    try {
        let queryBody = '';
        const currentTimestamp = Math.floor(Date.now() / 1000);

        switch (shelfId) {
            case 'trending_games':
                queryBody = `
                    fields name, cover.image_id, first_release_date, total_rating;
                    sort popularity desc;
                    limit ${limit};
                `;
                break;
            case 'anticipated_games':
                queryBody = `
                    fields name, cover.image_id, first_release_date, total_rating;
                    where first_release_date > ${currentTimestamp} & hypes != null;
                    sort hypes desc;
                    limit ${limit};
                `;
                break;
            case 'top_rated_games':
                queryBody = `
                    fields name, cover.image_id, first_release_date, total_rating;
                    where total_rating_count >= 100;
                    sort total_rating desc;
                    limit ${limit};
                `;
                break;
            case 'best_selling_games':
                queryBody = `
                    fields name, cover.image_id, first_release_date, total_rating;
                    where follows != null;
                    sort follows desc;
                    limit ${limit};
                `;
                break;
            case 'award_winning_games':
                queryBody = `
                    fields name, cover.image_id, first_release_date, total_rating;
                    where rating != null;
                    sort rating desc;
                    limit ${limit};
                `;
                break;
            default:
                return [];
        }

        // Use fetchIGDB directly instead of relative API route since we are server-side
        const { fetchIGDB } = await import('@/lib/api/igdb');
        const data: IGDBGame[] = await fetchIGDB('games', queryBody);

        return data.slice(0, limit).map(game => {
            const imageId = game.cover?.image_id;
            const releaseDate = game.first_release_date
                ? new Date(game.first_release_date * 1000)
                : null;

            return {
                id: String(game.id),
                title: game.name,
                posterUrl: imageId
                    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`
                    : '',
                rating: game.total_rating ? parseFloat((game.total_rating / 10).toFixed(1)) : 0,
                year: releaseDate ? releaseDate.getFullYear() : 0,
            };
        });
    } catch (error) {
        console.error(`Failed to fetch explore games for shelf ${shelfId}:`, error);
        return [];
    }
}
