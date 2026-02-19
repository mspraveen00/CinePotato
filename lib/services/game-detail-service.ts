import { TitleDetail } from '@/types/title';

interface IGDBDetail {
    id: number;
    name: string;
    summary?: string;
    cover?: { image_id: string };
    artworks?: { image_id: string }[];
    screenshots?: { image_id: string }[];
    first_release_date?: number;
    total_rating?: number;
    involved_companies?: { company: { name: string } }[];
    genres?: { name: string }[];
}

export async function getGameDetail(id: string): Promise<TitleDetail | null> {
    try {
        const body = `
            fields name, summary, cover.image_id, artworks.image_id, screenshots.image_id, 
                   first_release_date, total_rating, involved_companies.company.name, genres.name;
            where id = ${id};
        `;

        // Use the existing proxy, or if running server-side, could fetch directly if we exported raw fetchIGDB
        // But let's use the proxy pattern for consistency if we were client-side, 
        // OR better: since we are in a Server Component, we should reuse `fetchIGDB` from `lib/api/igdb` directly!
        // The implementation plan mentioned `app/api/igdb`, but for a Server Component `getGameDetail`, 
        // we should call `fetchIGDB` directly to avoid self-referencing API call overhead/issues.

        // Wait, `lib/services/game-search-service` used `fetch('/api/igdb/games')`.
        // That is CLIENT-SIDE service logic usually? No, `searchTitles` is called by `app/search/page` which is client.
        // `app/game/[id]/page` is a Server Component.
        // So `getGameDetail` should use `fetchIGDB` directly.

        // Let's import fetchIGDB.
        const { fetchIGDB } = await import('@/lib/api/igdb');

        const data = await fetchIGDB<IGDBDetail[]>('games', body);

        if (!data || data.length === 0) return null;

        const game = data[0];

        // Process Backdrops: Artworks first, then Screenshots
        // IGDB images: https://images.igdb.com/igdb/image/upload/t_{size}/{hash}.jpg
        // Sizes: screenshot_huge, 1080p, 720p
        const artworks = (game.artworks || []).map(a => `https://images.igdb.com/igdb/image/upload/t_1080p/${a.image_id}.jpg`);
        const screenshots = (game.screenshots || []).map(s => `https://images.igdb.com/igdb/image/upload/t_1080p/${s.image_id}.jpg`);

        const backdropImages = [...artworks, ...screenshots];

        return {
            id: String(game.id),
            title: game.name,
            overview: game.summary || "No overview available.",
            backdropImages: backdropImages,
            posterPath: game.cover
                ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
                : "",
            releaseYear: game.first_release_date
                ? new Date(game.first_release_date * 1000).getFullYear()
                : 0,
            runtime: "N/A",
            genres: (game.genres || []).map(g => g.name),
            rating: game.total_rating ? parseFloat((game.total_rating / 10).toFixed(1)) : 0,
            // IGDB has no dedicated logo, map best effort or leave undefined (HeroBanner falls back to text)
            logoPath: undefined
        };

    } catch (error) {
        console.error("Game Detail Service Error:", error);
        return null;
    }
}
