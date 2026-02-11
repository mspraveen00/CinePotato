"use client"

import * as React from "react"
import { MediaSwitcher } from "./MediaSwitcher"
import { ContentShelf } from "./ContentShelf"
import { LetterboxdSection } from "./LetterboxdSection"
import { ShelfType, ShelfConfig, MockItem } from "@/lib/constants/explore"

interface ExploreFeedProps {
    movies: (ShelfConfig & { items: MockItem[] })[]
    tv: (ShelfConfig & { items: MockItem[] })[]
    games: (ShelfConfig & { items: MockItem[] })[]
}

export function ExploreFeed({ movies, tv, games }: ExploreFeedProps) {
    const [activeType, setActiveType] = React.useState<ShelfType>("movies")

    const currentData = activeType === "movies" ? movies :
        activeType === "tv" ? tv :
            games

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
