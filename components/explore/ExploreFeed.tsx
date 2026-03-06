"use client"

import * as React from "react"
import { MediaSwitcher } from "./MediaSwitcher"
import { ContentShelf } from "./ContentShelf"
import { LetterboxdSection } from "./LetterboxdSection"
import { ShelfType, ShelfConfig, ExploreItem } from "@/lib/constants/explore"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

interface ExploreFeedProps {
    movies: (ShelfConfig & { items: ExploreItem[] })[]
    tv: (ShelfConfig & { items: ExploreItem[] })[]
    games: (ShelfConfig & { items: ExploreItem[] })[]
}

export function ExploreFeed({ movies, tv, games }: ExploreFeedProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const activeType = (searchParams.get("type") as ShelfType) || "movies"

    const setActiveType = React.useCallback((newType: ShelfType) => {
        const params = new URLSearchParams(searchParams.toString())
        if (newType === "movies") {
            params.delete("type")
        } else {
            params.set("type", newType)
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [pathname, router, searchParams])

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
                            <ContentShelf
                                shelfId={shelf.id}
                                title={shelf.title}
                                items={shelf.items}
                                mediaType={activeType}
                            />

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
