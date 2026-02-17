"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';

interface SortableItemProps {
    id: number;
    children: React.ReactNode;
    enabled: boolean;
}

export function SortableItem({ id, children, enabled }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, disabled: !enabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {children}

            {/* Drag Handle Overlay - Only visible when enabled */}
            {enabled && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-1/2 left-4 -translate-y-1/2 z-30 p-2 bg-black/60 rounded cursor-grab active:cursor-grabbing hover:bg-black/80 transition-colors"
                >
                    <GripHorizontal className="w-6 h-6 text-white" />
                </div>
            )}
        </div>
    );
}
