"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ShelfType } from "@/lib/constants/explore"

interface MediaSwitcherProps {
    activeType: ShelfType
    onTypeChange: (type: ShelfType) => void
}

export function MediaSwitcher({ activeType, onTypeChange }: MediaSwitcherProps) {
    const options: { value: ShelfType; label: string }[] = [
        { value: "movies", label: "Movies" },
        { value: "tv", label: "TV Series" },
        { value: "games", label: "Games" },
    ]

    return (
        <div className="flex justify-center py-6">
            <div className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 p-1 text-muted-foreground border border-white/10">
                {options.map((option) => {
                    const isActive = activeType === option.value
                    return (
                        <button
                            key={option.value}
                            onClick={() => onTypeChange(option.value)}
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                isActive
                                    ? "bg-white text-black shadow-sm"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
