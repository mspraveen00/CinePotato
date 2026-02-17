"use client";

import React, { useState } from 'react';
import { FilterState, MediaType } from '@/lib/store/user-lists-store';
import { ChevronDown, ArrowUp, ArrowDown, X } from 'lucide-react';

interface FilterBarProps {
    filters: FilterState;
    onChange: (filters: Partial<FilterState>) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {


    return (
        <div className="flex flex-wrap items-center gap-4 py-4 border-t border-neutral-800">
            {/* Filters Only */}

            {/* User Rating Filter (Bucket) */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 uppercase font-semibold">Your Rating</span>
                <select
                    className="bg-neutral-900 border border-neutral-800 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-white transition-colors"
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val)) onChange({ userRating: [] });
                        else onChange({ userRating: [val] }); // Single bucket for simplicity in UI, logic supports array
                    }}
                    value={filters.userRating[0] || ""}
                >
                    <option value="">All Ratings</option>
                    <option value="10">10 Stars</option>
                    <option value="9">9 Stars</option>
                    <option value="8">8 Stars</option>
                    <option value="7">7 Stars</option>
                    <option value="6">6 Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {/* Keyword Filter Trigger (Placeholder for Overlay) */}
            <button className="text-sm text-neutral-400 hover:text-white underline">
                + Keywords
            </button>

            {/* Clear All */}
            {(filters.userRating.length > 0 || filters.mediaTypes.length > 0) && (
                <button
                    onClick={() => onChange({ userRating: [], mediaTypes: [], genres: [], keywords: [] })}
                    className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                    <X className="w-3 h-3" /> Clear Filters
                </button>
            )}
        </div>
    );
}
