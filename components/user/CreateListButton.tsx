import { Plus } from 'lucide-react';
import React from 'react';

interface CreateListButtonProps {
    onClick: () => void;
}

export function CreateListButton({ onClick }: CreateListButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
        >
            <Plus className="w-4 h-4" />
            Create a new list
        </button>
    );
}
