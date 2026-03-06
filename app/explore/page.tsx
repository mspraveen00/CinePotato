import * as React from "react"
import { ExploreFeed } from "@/components/explore/ExploreFeed"
import { MOVIE_SHELVES, TV_SHELVES, GAME_SHELVES } from "@/lib/constants/explore"
import { getExploreMovies } from "@/lib/services/movie-service"
import { getExploreTVs } from "@/lib/services/tv-service"
import { getExploreGames } from "@/lib/services/game-search-service"

export default async function ExplorePage() {
    // Fetch data for all shelves in parallel
    const [movieShelvesData, tvShelvesData, gameShelvesData] = await Promise.all([
        Promise.all(MOVIE_SHELVES.map(async shelf => ({
            ...shelf,
            items: await getExploreMovies(shelf.id)
        }))),
        Promise.all(TV_SHELVES.map(async shelf => ({
            ...shelf,
            items: await getExploreTVs(shelf.id)
        }))),
        Promise.all(GAME_SHELVES.map(async shelf => ({
            ...shelf,
            items: await getExploreGames(shelf.id)
        })))
    ]);

    return (
        <div className="min-h-screen">
            <React.Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading feed...</div>}>
                <ExploreFeed movies={movieShelvesData} tv={tvShelvesData} games={gameShelvesData} />
            </React.Suspense>
        </div>
    )
}
