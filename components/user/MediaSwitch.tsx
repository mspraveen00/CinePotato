"use client";

import React from 'react';
import { MediaType } from '@/lib/store/user-lists-store';

interface MediaSwitchProps {
    selectedTypes: MediaType[];
    availableTypes: MediaType[]; // Provided by parent based on list type
    onChange: (types: MediaType[]) => void;
}

export function MediaSwitch({ selectedTypes, availableTypes, onChange }: MediaSwitchProps) {
    const handleToggle = (type: MediaType) => {
        // Multi-select allowed? "Switch filters list locally" - usually single select for pills or multi.
        // Let's implement single select "All" vs specific type behavior based on req "Media types: Movie, TV..."
        // If it's a pill selector for a list, typically it's one active view at a time or multi-filter. 
        // "Switch filters list locally" implies basic filtering.
        // Let's allow multi-select for now as it's more flexible, or toggle.

        // If clicking currently active single type, clear it (show all)
        if (selectedTypes.includes(type) && selectedTypes.length === 1) {
            onChange([]);
        }
        // If clicking a new type, set it as active (single select behavior feels better for a "Switch")
        else {
            onChange([type]);
        }
    };

    return (
        <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-lg">
            <button
                onClick={() => onChange([])}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTypes.length === 0 ? 'bg-white text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}
            >
                All
            </button>
            {availableTypes.map(type => (
                <button
                    key={type}
                    onClick={() => handleToggle(type)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${selectedTypes.includes(type) ? 'bg-white text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}
                >
                    {type}
                </button>
            ))}
        </div>
    );
}
