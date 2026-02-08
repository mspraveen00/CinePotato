"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { MediaCard } from "./MediaCard"
import { MockItem } from "@/lib/constants/explore"
import { cn } from "@/lib/utils"

interface ContentShelfProps {
    title: string
    items: MockItem[]
    className?: string
}

export function ContentShelf({ title, items, className }: ContentShelfProps) {
    return (
        <section className={cn("flex flex-col gap-4 py-4", className)}>
            {/* Shelf Header - Padding matches gap (4 = 1rem) */}
            <h2 className="flex items-center gap-2 text-xl font-bold text-white px-4 md:px-8 cursor-pointer group hover:text-blue-400 transition-colors">
                <span>{title}</span>
                <ChevronRight className="text-neutral-500 group-hover:text-blue-400 transition-colors" size={20} />
            </h2>

            {/* Horizontal Scroll Container */}
            <div
                className="
            flex gap-4 overflow-x-auto pb-4 
            snap-x snap-mandatory 
        "
            >
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={cn(
                            "snap-start",
                            index === 0 && "ml-4 md:ml-8", // Left spacing for first item
                        )}
                    >
                        <MediaCard item={item} />
                    </div>
                ))}

                {/* See All Card */}
                <div
                    className={cn(
                        "snap-start flex flex-col gap-2 w-[140px] md:w-[160px] flex-shrink-0 mr-4 md:mr-8 cursor-pointer group/see-all"
                    )}
                >
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center group-hover/see-all:bg-white/5 transition-colors">
                        <div className="flex flex-col items-center gap-2 text-neutral-400 group-hover/see-all:text-blue-400 transition-colors">
                            <span className="font-medium">See All</span>
                            <div className="h-8 w-8 rounded-full border border-current flex items-center justify-center">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-transparent">Placeholder</span> {/* Spacer to align with titles */}
                </div>
            </div>
        </section>
    )
}
