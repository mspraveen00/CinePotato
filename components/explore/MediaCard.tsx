import * as React from "react"
import { cn } from "@/lib/utils"
import { ExploreItem } from "@/lib/constants/explore"
import Link from "next/link"

interface MediaCardProps {
    item: ExploreItem
    mediaType: "movies" | "tv" | "games"
    variant?: "poster" | "wide"
    className?: string
}

export function MediaCard({ item, mediaType, variant = "poster", className }: MediaCardProps) {
    // Map mediaType to route prefix
    const routePrefix = mediaType === "movies" ? "movie" : mediaType === "tv" ? "tv" : "game"
    const href = `/${routePrefix}/${item.id}`

    if (variant === "wide") {
        return (
            <Link
                href={href}
                className={cn("group relative block overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors h-[120px] md:h-[150px]", className)}
            >
                <div className="flex h-full">
                    {/* Left: Poster */}
                    <div className="relative w-[80px] md:w-[100px] shrink-0 border-r border-neutral-800 z-10 bg-neutral-800">
                        {item.posterUrl ? (
                            <img
                                src={item.posterUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-600 font-bold text-2xl">
                                {item.title.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 flex flex-col p-3 md:p-5 relative z-10">
                        <h3 className="text-sm md:text-lg font-bold text-white leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                            {item.title}
                        </h3>
                        <div className="flex items-center gap-1.5 md:gap-2 mt-1 text-xs md:text-sm text-neutral-400">
                            <span className="uppercase tracking-wider text-[10px] md:text-xs font-semibold px-1.5 py-0.5 bg-white/10 rounded">
                                {mediaType}
                            </span>
                            <span>•</span>
                            <span>{item.year || 'N/A'}</span>
                        </div>

                        <div className="mt-auto flex items-center">
                            <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full border border-white/10 text-xs text-yellow-500 font-medium">
                                ★ {item.rating}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

    // Default poster variant
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
