"use client";

import React from 'react';
import { MediaType } from '@/lib/store/user-lists-store';
import { cn } from "@/lib/utils";

interface MediaSwitchProps {
    selectedTypes: MediaType[];
    availableTypes: MediaType[];
    onChange: (types: MediaType[]) => void;
}

export function MediaSwitch({ selectedTypes, availableTypes, onChange }: MediaSwitchProps) {
    // "All" is when selectedTypes is empty.
    const isAll = selectedTypes.length === 0;

    // We only support single select UI mainly to match the tabs look, 
    // but the store supports array. We'll treat it as single select for the UI.
    const activeType = isAll ? 'all' : selectedTypes[0];

    const handleTypeChange = (type: string) => {
        if (type === 'all') {
            onChange([]);
        } else {
            onChange([type as MediaType]);
        }
    };

    // Filter available types to only show usually relevant ones if needed, 
    // or just show what's passed.
    // The user wants it "Same as Explore", which has Movies, TV, Games.
    // We might have 'episode' or 'person' passed in.

    const tabs = [
        { value: 'all', label: 'All' },
        ...availableTypes.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))
    ];

    return (
        <div className="flex justify-center w-full">
            <div className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 p-1 text-neutral-400 border border-white/10 overflow-x-auto max-w-full scrollbar-hide">
                {tabs.map((tab) => {
                    const isActive = activeType === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => handleTypeChange(tab.value)}
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 md:px-6 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                isActive
                                    ? "bg-white text-black shadow-sm"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
