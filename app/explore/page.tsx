import { ExploreFeed } from "@/components/explore/ExploreFeed"
import { MOVIE_SHELVES, TV_SHELVES, GAME_SHELVES } from "@/lib/constants/explore"
import { generateMockItems } from "@/lib/mock-data"

export default function ExplorePage() {
    const movies = MOVIE_SHELVES.map(shelf => ({ ...shelf, items: generateMockItems(10, "movies") }))
    const tv = TV_SHELVES.map(shelf => ({ ...shelf, items: generateMockItems(10, "tv") }))
    const games = GAME_SHELVES.map(shelf => ({ ...shelf, items: generateMockItems(10, "games") }))

    return (
        <div className="min-h-screen">
            <ExploreFeed movies={movies} tv={tv} games={games} />
        </div>
    )
}
