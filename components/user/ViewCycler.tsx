"use client";

import React from 'react';
import { ViewMode } from '@/lib/store/user-lists-store';
import { LayoutGrid, Grip, Rows, StretchHorizontal } from 'lucide-react';

interface ViewCyclerProps {
    currentMode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewCycler({ currentMode, onChange }: ViewCyclerProps) {
    const cycleView = () => {
        // Toggle between Wide (List) and Poster-5 (Grid)
        const nextMode = currentMode === 'wide' ? 'poster-5' : 'wide';
        onChange(nextMode);
    };

    const getIcon = () => {
        // If current is wide, next is grid, so show Grid icon? Or show current icon?
        // Usually buttons show what is currently active or what will happen.
        // Let's show the CURRENT mode icon.
        if (currentMode === 'wide') return <StretchHorizontal className="w-5 h-5" />;
        return <LayoutGrid className="w-5 h-5" />;
    };

    return (
        <button
            onClick={cycleView}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-white"
            title={currentMode === 'wide' ? "Switch to Grid View" : "Switch to List View"}
        >
            {getIcon()}
        </button>
    );
}
