"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FilterState } from '@/lib/store/user-lists-store';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from 'lucide-react';

interface SortMenuProps {
    filters: FilterState;
    onChange: (filters: Partial<FilterState>) => void;
}

export function SortMenu({ filters, onChange }: SortMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const sortOptions = [
        { value: 'popularity', label: 'Popularity' },
        { value: 'rating_imdb', label: 'IMDb Rating' },
        { value: 'rating_user', label: 'User Rating' },
        { value: 'manual', label: 'Manual Order' },
    ];

    const currentSortLabel = sortOptions.find(o => o.value === filters.sort)?.label || 'Sort';

    const handleSortSelect = (value: string) => {
        if (value === filters.sort) {
            // Toggle direction if same sort selected
            onChange({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' });
        } else {
            // Default to desc for ratings/popularity usually, asc for title?
            // Let's stick to existing logic or default desc
            onChange({ sort: value as any, sortDirection: 'desc' });
        }
        setIsOpen(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-sm font-medium transition-colors border border-neutral-800 ${isOpen ? 'ring-2 ring-white/20' : ''}`}
            >
                <ArrowUpDown className="w-4 h-4 text-neutral-400" />
                <span>{currentSortLabel}</span>
                <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden fade-in animate-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase border-b border-neutral-800">
                        Sort By
                    </div>
                    <div className="p-1">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortSelect(option.value)}
                                className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${filters.sort === option.value ? 'bg-primary/20 text-primary' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}
                            >
                                <span>{option.label}</span>
                                {filters.sort === option.value && (
                                    filters.sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
