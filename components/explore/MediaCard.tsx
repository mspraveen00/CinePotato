import * as React from "react"
import { cn } from "@/lib/utils"
import { ExploreItem } from "@/lib/constants/explore"

interface MediaCardProps {
    item: ExploreItem
    className?: string
}

export function MediaCard({ item, className }: MediaCardProps) {
    return (
        <div className={cn("group relative flex flex-col gap-2 w-[140px] md:w-[160px] flex-shrink-0", className)}>
            {/* Poster Image Container */}
            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-neutral-800 border border-neutral-800 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md cursor-pointer relative">
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
            <div className="flex flex-col gap-0.5">
                <h3 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-blue-400 transition-colors cursor-pointer">
                    {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>{item.year}</span>
                    <span>•</span>
                    <span className="text-yellow-500">★ {item.rating}</span>
                </div>
            </div>
        </div>
    )
}
