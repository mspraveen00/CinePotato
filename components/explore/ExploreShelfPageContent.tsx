"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { ExploreItem } from '@/lib/constants/explore'
import { ViewCycler, ViewMode } from '@/components/user/ViewCycler'
import { MediaCard } from './MediaCard'
import { UserListLayout } from '@/components/user/UserListLayout'
import Link from 'next/link'

interface ExploreShelfPageContentProps {
    shelfId: string
    title: string
    items: ExploreItem[]
    mediaType: "movies" | "tv" | "games"
}

export function ExploreShelfPageContent({ shelfId, title, items, mediaType }: ExploreShelfPageContentProps) {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<ViewMode>('poster-6')

    const gridClass = () => {
        switch (viewMode) {
            case 'wide': return 'grid-cols-1 md:grid-cols-2 gap-4'
            case 'wide-3': return 'grid-cols-1 md:grid-cols-3 gap-4'
            case 'poster-6': return 'grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4' // Using lg for 6
            case 'poster-7': return 'grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4'
            default: return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
        }
    }

    return (
        <UserListLayout title={title}>
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-3 ml-auto">
                    <div className="bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                        <ViewCycler
                            currentMode={viewMode}
                            onChange={(mode) => setViewMode(mode)}
                        />
                    </div>
                </div>
            </div>

            {/* Note: since standard explore items only return poster url, rating, year, and title, 
                rendering them in 'wide' view will just render differently shaped cards for now. 
                We will reuse MediaCard for poster views and adapt it.
            */}

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/50">
                    <p className="text-neutral-400">No items found.</p>
                </div>
            ) : (
                <div className={`grid ${gridClass()}`}>
                    {items.map(item => (
                        <div key={item.id} className="flex justify-center w-full">
                            {/* Pass down mediaType for linking correctly */}
                            <MediaCard
                                item={item}
                                mediaType={mediaType}
                                variant={viewMode.startsWith('wide') ? 'wide' : 'poster'}
                                className="w-full"
                            />
                        </div>
                    ))}
                </div>
            )}
        </UserListLayout>
    )
}
