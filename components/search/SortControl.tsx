import { SortOption } from '@/types/search';
import { ArrowUp, ArrowDown, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SortControlProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating_desc', label: 'Rating' },
    { value: 'popularity_desc', label: 'Popularity' },
    { value: 'date_desc', label: 'Release Date' },
    { value: 'votes_desc', label: 'Votes' },
];

export function SortControl({ value, onChange }: SortControlProps) {
    // Helper to get base sort type (e.g., 'rating') from 'rating_desc'
    const getBaseType = (option: SortOption) => option.split('_')[0];
    const getDirection = (option: SortOption) => option.split('_')[1] || 'desc';

    const currentBase = getBaseType(value);
    const currentDirection = getDirection(value);

    const handleSortClick = (baseType: string) => {
        if (baseType === 'relevance') {
            onChange('relevance');
            return;
        }

        // If clicking same type, toggle direction
        if (baseType === currentBase) {
            const newDirection = currentDirection === 'desc' ? 'asc' : 'desc';
            onChange(`${baseType}_${newDirection}` as SortOption);
        } else {
            // Default to desc for new type
            onChange(`${baseType}_desc` as SortOption);
        }
    };

    return (
        <div className="flex items-center justify-end mb-4 gap-2">
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider flex items-center gap-1">
                <ListFilter className="w-3 h-3" />
                Sort By
            </span>
            <div className="bg-neutral-900/80 border border-white/5 rounded-lg p-1 flex gap-1">
                {SORT_OPTIONS.map((option) => {
                    const baseType = getBaseType(option.value);
                    const isActive = currentBase === baseType;

                    return (
                        <button
                            key={baseType}
                            onClick={() => handleSortClick(baseType)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                                isActive ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {option.label}
                            {isActive && baseType !== 'relevance' && (
                                currentDirection === 'asc'
                                    ? <ArrowUp className="w-3 h-3" />
                                    : <ArrowDown className="w-3 h-3" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
