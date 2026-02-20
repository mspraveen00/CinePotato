import { TitleDetail } from '@/types/title';

interface IGDBArtwork {
    image_id: string;
    artwork_type: number; // 1=Artwork, 2=No Logo, 3=With Logo, 4=Concept, 5=White Logo, 6=Black Logo, 7=Color Logo
}

interface IGDBDetail {
    id: number;
    name: string;
    summary?: string;
    cover?: { image_id: string };
    artworks?: IGDBArtwork[];
    screenshots?: { image_id: string }[];
    first_release_date?: number;
    total_rating?: number;
    involved_companies?: { company: { name: string } }[];
    genres?: { name: string }[];
}

export async function getGameDetail(id: string): Promise<TitleDetail | null> {
    try {
        // Query fields: include artworks.artwork_type for logo/backdrop filtering
        // Correct field name is 'artwork_type', not 'type'
        const body = `
            fields name, summary, cover.image_id, artworks.image_id, artworks.artwork_type, screenshots.image_id, 
                   first_release_date, total_rating, involved_companies.company.name, genres.name;
            where id = ${id};
        `;

        const { fetchIGDB } = await import('@/lib/api/igdb');

        const data = await fetchIGDB<IGDBDetail[]>('games', body);

        if (!data || data.length === 0) return null;

        const game = data[0];
        const rawArtworks = game.artworks || [];

        // Logo Logic: Look for Game Logo types (7=Color, 5=White, 6=Black)
        // We prefer Color (7) -> White (5) -> Black (6)
        const logoArt = rawArtworks
            .filter(a => [7, 5, 6].includes(a.artwork_type))
            .sort((a, b) => {
                const priority = { 7: 0, 5: 1, 6: 2 };
                return (priority[a.artwork_type as keyof typeof priority] ?? 9) - (priority[b.artwork_type as keyof typeof priority] ?? 9);
            })[0];

        // Use PNG for logos to ensure transparency if available
        const logoPath = logoArt
            ? `https://images.igdb.com/igdb/image/upload/t_1080p/${logoArt.image_id}.png`
            : undefined;

        // Backdrop Logic
        // 1. Key Art without Logo (Type 2) - Highest Priority
        // 2. Standard Artwork (Type 1), Concept Art (Type 4)
        // 3. Screenshots (Gameplay)
        // Exclude: Key Art with Logo (Type 3) and Logos (5,6,7) from backdrops to avoid text clutter.

        const cleanArt = rawArtworks
            .filter(a => a.artwork_type === 2)
            .map(a => `https://images.igdb.com/igdb/image/upload/t_1080p/${a.image_id}.jpg`);

        const otherArt = rawArtworks
            .filter(a => [1, 4].includes(a.artwork_type))
            .map(a => `https://images.igdb.com/igdb/image/upload/t_1080p/${a.image_id}.jpg`);

        const screenshots = (game.screenshots || [])
            .map(s => `https://images.igdb.com/igdb/image/upload/t_1080p/${s.image_id}.jpg`);

        let backdropImages = [...cleanArt, ...otherArt, ...screenshots];

        // Fallback: If no clean backdrops found, allow Key Art with Logo (Type 3)
        // This prevents having NO backdrops if only branded art exists.
        if (backdropImages.length === 0) {
            const logoBackdrops = rawArtworks
                .filter(a => a.artwork_type === 3)
                .map(a => `https://images.igdb.com/igdb/image/upload/t_1080p/${a.image_id}.jpg`);
            backdropImages = [...logoBackdrops];
        }

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
            // Involved companies -> map to "Publisher / Developer" if needed, 
            // for now just mapping to genres as UI expects genres for the chips.
            // We could map companies to a new field if TitleDetail supported it.
            // UI uses `genres` for the main chips.
            genres: (game.genres || []).map(g => g.name),
            rating: game.total_rating ? parseFloat((game.total_rating / 10).toFixed(1)) : 0,
            logoPath: logoPath
        };

    } catch (error) {
        console.error("Game Detail Service Error:", error);
        return null;
    }
}
