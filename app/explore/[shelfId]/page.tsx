import { getExploreMovies } from '@/lib/services/movie-service';
import { getExploreTVs } from '@/lib/services/tv-service';
import { getExploreGames } from '@/lib/services/game-search-service';
import { MOVIE_SHELVES, TV_SHELVES, GAME_SHELVES, ExploreItem } from '@/lib/constants/explore';
import { ExploreShelfPageContent } from '@/components/explore/ExploreShelfPageContent';

export default async function ExploreShelfPage({ params }: { params: Promise<{ shelfId: string }> }) {
    const resolvedParams = await params;
    const { shelfId } = resolvedParams;

    let title = 'Unknown Shelf';
    let items: ExploreItem[] = [];
    let mediaType: "movies" | "tv" | "games" = "movies";

    // Determine shelf category and fetch
    // Fetch limits set to 20 for full page display
    if (MOVIE_SHELVES.find(s => s.id === shelfId)) {
        title = MOVIE_SHELVES.find(s => s.id === shelfId)!.title;
        mediaType = "movies";
        items = await getExploreMovies(shelfId, 20);
    } else if (TV_SHELVES.find(s => s.id === shelfId)) {
        title = TV_SHELVES.find(s => s.id === shelfId)!.title;
        mediaType = "tv";
        items = await getExploreTVs(shelfId, 20);
    } else if (GAME_SHELVES.find(s => s.id === shelfId)) {
        title = GAME_SHELVES.find(s => s.id === shelfId)!.title;
        mediaType = "games";
        items = await getExploreGames(shelfId, 20);
    } else {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <h2 className="text-2xl font-bold text-white mb-2">Shelf Not Found</h2>
                <p className="text-neutral-400">The requested explore shelf could not be found.</p>
            </div>
        );
    }

    return (
        <ExploreShelfPageContent
            shelfId={shelfId}
            title={title}
            items={items}
            mediaType={mediaType}
        />
    );
}
