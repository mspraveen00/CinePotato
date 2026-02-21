import * as React from "react"
import { cn } from "@/lib/utils"
import { ExploreItem } from "@/lib/constants/explore"
import Link from "next/link"

interface MediaCardProps {
    item: ExploreItem
    mediaType: "movies" | "tv" | "games"
    className?: string
}

export function MediaCard({ item, mediaType, className }: MediaCardProps) {
    // Map mediaType to route prefix
    const routePrefix = mediaType === "movies" ? "movie" : mediaType === "tv" ? "tv" : "game"
    const href = `/${routePrefix}/${item.id}`

    return (
        <Link
            href={href}
            className={cn("group relative flex flex-col gap-2 w-[140px] md:w-[160px] flex-shrink-0 cursor-pointer block", className)}
        >
            {/* Poster Image Container */}
            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-neutral-800 border border-neutral-800 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md relative">
                {item.posterUrl ? (
                    <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-600 font-bold text-4xl">
                        {item.title.charAt(0)}
                    </div>
                )}
            </div>

            {/* Title & Meta */}
            <div className="flex flex-col gap-0.5 pointer-events-none">
                <h3 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>{item.year || 'N/A'}</span>
                    <span>•</span>
                    <span className="text-yellow-500">★ {item.rating}</span>
                </div>
            </div>
        </Link>
    )
}
