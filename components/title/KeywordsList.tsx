'use client';

import React, { useState } from 'react';
import { KeywordItem } from '@/types/title';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';

interface KeywordsListProps {
    keywords: KeywordItem[];
}

export default function KeywordsList({ keywords }: KeywordsListProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!keywords || keywords.length === 0) return null;

    const INITIAL_LIMIT = 10;
    const hasMore = keywords.length > INITIAL_LIMIT;
    const displayedKeywords = isExpanded ? keywords : keywords.slice(0, INITIAL_LIMIT);

    // Helper to capitalize words
    const formatTagName = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <div className="pt-3">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <Tag size={13} className="text-amber-400/80" />
                <span>Tags & Themes</span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                {displayedKeywords.map((kw) => (
                    <span
                        key={kw.id}
                        className="px-3 py-1 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800/80 hover:border-neutral-700/80 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-default select-none shadow-sm"
                    >
                        #{formatTagName(kw.name)}
                    </span>
                ))}

                {hasMore && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-400/90 hover:text-amber-300 hover:bg-amber-400/10 rounded-full transition-colors font-medium cursor-pointer"
                        title={isExpanded ? 'Show fewer tags' : 'Show all tags'}
                    >
                        <span>{isExpanded ? 'Show less' : `+${keywords.length - INITIAL_LIMIT} more`}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                )}
            </div>
        </div>
    );
}
