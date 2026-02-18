"use client";

import React from 'react';
import { ViewMode } from '@/lib/store/user-lists-store';
import { LayoutGrid, StretchHorizontal } from 'lucide-react';

interface ViewCyclerProps {
    currentMode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewCycler({ currentMode, onChange }: ViewCyclerProps) {
    const cycleView = () => {
        // Cycle: Standard List -> Dense List -> Standard Grid -> Dense Grid -> repeat.
        // wide (2 Col) -> wide-3 (3 Col) -> poster-6 (6 Col) -> poster-7 (7 Col)

        // Mapping for fallback or legacy states:
        // if user is on poster-2/3/4/5, jump to poster-6

        switch (currentMode) {
            case 'wide': return onChange('wide-3');
            case 'wide-3': return onChange('poster-6');
            case 'poster-6': return onChange('poster-7');
            case 'poster-7': return onChange('wide');
            // Recovery from legacy states
            default: return onChange('wide');
        }
    };

    const getIcon = () => {
        // Show icon representing NEXT state or CURRENT? 
        // User said "Just like before", which showed current.
        if (currentMode === 'wide' || currentMode === 'wide-3') return <StretchHorizontal className="w-5 h-5" />;
        return <LayoutGrid className="w-5 h-5" />;
    };

    const getTitle = () => {
        switch (currentMode) {
            case 'wide': return "Wide List (2 col)";
            case 'wide-3': return "Wide List (3 col)";
            case 'poster-6': return "Posters (6 col)";
            case 'poster-7': return "Posters (7 col)";
            default: return "Change View";
        }
    }

    return (
        <button
            onClick={cycleView}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-white"
            title={getTitle()}
        >
            {getIcon()}
        </button>
    );
}
