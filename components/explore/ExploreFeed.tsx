"use client"

import * as React from "react"
import { MediaSwitcher } from "./MediaSwitcher"
import { ContentShelf } from "./ContentShelf"
import { LetterboxdSection } from "./LetterboxdSection"
import { MOVIE_SHELVES, TV_SHELVES, GAME_SHELVES, ShelfType } from "@/lib/constants/explore"
import { generateMockItems } from "@/lib/mock-data"

export function ExploreFeed() {
    const [activeType, setActiveType] = React.useState<ShelfType>("movies")

    // Memoize mock data to prevent regeneration on every render
    const movieShelvesData = React.useMemo(() => MOVIE_SHELVES.map(shelf => ({ ...shelf, items: generateMockItems(10, "movies") })), [])
    const tvShelvesData = React.useMemo(() => TV_SHELVES.map(shelf => ({ ...shelf, items: generateMockItems(10, "tv") })), [])
    const gameShelvesData = React.useMemo(() => GAME_SHELVES.map(shelf => ({ ...shelf, items: generateMockItems(10, "games") })), [])

    const currentData = activeType === "movies" ? movieShelvesData :
        activeType === "tv" ? tvShelvesData :
            gameShelvesData

    return (
        <div className="flex flex-col min-h-screen pb-20 fade-in animate-in duration-500">
            <MediaSwitcher activeType={activeType} onTypeChange={setActiveType} />

            <div className="flex flex-col gap-2">
                {currentData.map((shelf, index) => {
                    // Logic to insert Letterboxd section for movies
                    // It should probably go after "Anticipated Movies" or similar, 
                    // Prompts says "Special Movies Section (Non-Shelf)... Include a distinct link section"
                    // Doesn't strictly specify position, but commonly it fits between shelves.
                    // Let's place it after the 2nd shelf (Anticipated) for movies.

                    return (
                        <React.Fragment key={shelf.id}>
                            <ContentShelf title={shelf.title} items={shelf.items} />

                            {activeType === "movies" && index === 1 && (
                                <LetterboxdSection />
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}
