"use client";

import { useState, useMemo } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { MediaTypeSwitch } from '@/components/search/MediaTypeSwitch';
import { ModeSwitch } from '@/components/search/ModeSwitch';
import { SearchResults } from '@/components/search/SearchResults';
import { RecentSearches } from '@/components/search/RecentSearches';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { SortControl } from '@/components/search/SortControl';
import { MediaType, SearchFilters, SortOption } from '@/types/search';
import { mockSearchResults } from '@/data/mockSearchData';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [activeMediaType, setActiveMediaType] = useState<MediaType>('movie');
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('relevance');
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        mediaTypes: ['movie'],
    });
    const [recentSearches, setRecentSearches] = useState<string[]>(['Inception', 'Breaking Bad', 'The Witcher']);

    // New State for Advanced Search Workflow
    const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
    const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

    // Handle Search Mode Toggle
    const handleModeToggle = (advanced: boolean) => {
        setIsAdvanced(advanced);
        // Reset collapse state when toggling modes
        setIsFiltersCollapsed(false);
        setHasAppliedFilters(false);

        // When switching to Advanced, ensure MediaType is valid (no Person)
        if (advanced && activeMediaType === 'person') {
            setActiveMediaType('movie');
        }
    };

    // Handle Apply Filters
    const handleApplyFilters = () => {
        setIsFiltersCollapsed(true);
        setHasAppliedFilters(true);
    };

    // Filter Logic
    const filteredResults = useMemo(() => {
        if (!query && !isAdvanced) return [];

        // In Advanced Mode, only show results if filters have been applied
        if (isAdvanced && !hasAppliedFilters) return [];

        let results = mockSearchResults.filter(item => {
            // 1. Media Type Filter (Primary)
            let typeMatch = false;
            if (activeMediaType === 'tv') {
                typeMatch = item.mediaType === 'tv' || item.mediaType === 'episode';
            } else {
                typeMatch = item.mediaType === activeMediaType;
            }

            if (!typeMatch) return false;

            // 2. Query Filter (Quick Search)
            if (query) {
                const searchTerms = query.toLowerCase().trim().split(' ');
                const title = item.title.toLowerCase();
                const originalTitle = item.originalTitle?.toLowerCase() || '';
                const parentSeries = item.parentSeriesTitle?.toLowerCase() || '';

                // Check for Season/Episode pattern SXXEXX
                const seRegex = /s(\d+)e(\d+)/i;
                const seMatch = query.match(seRegex);

                if (seMatch && item.mediaType === 'episode') {
                    const [_, s, e] = seMatch;
                    const seasonNum = parseInt(s);
                    const episodeNum = parseInt(e);

                    if (item.seasonNumber === seasonNum && item.episodeNumber === episodeNum) {
                        const textPart = query.replace(seMatch[0], '').trim();
                        if (!textPart || parentSeries.includes(textPart) || "game of thrones".includes(textPart) || "breaking bad".includes(textPart)) {
                            return true;
                        }
                    }
                }

                const matchesTitle = searchTerms.every(term =>
                    title.includes(term) ||
                    originalTitle.includes(term) ||
                    parentSeries.includes(term)
                );

                if (matchesTitle) return true;

                return false;
            }

            // 3. Advanced Filters
            if (isAdvanced) {
                if (filters.minRating && (item.rating || 0) < filters.minRating) return false;
                if (filters.genres && filters.genres.length > 0 && item.genreIds) {
                    if (!filters.genres.some(g => item.genreIds?.includes(g as number))) return false;
                }
                if (filters.minVotes && (item.voteCount || 0) < filters.minVotes) return false;

                if (filters.releaseDecade && item.releaseDate) {
                    const year = new Date(item.releaseDate).getFullYear();
                    if (year < filters.releaseDecade || year >= filters.releaseDecade + 10) return false;
                    if (filters.releaseYear && year !== filters.releaseYear) return false;
                }

                // Awards Filter
                if (filters.awards && filters.awards.length > 0) {
                    // Check if item has ANY of the selected awards
                    if (!item.awards || !filters.awards.some(a => item.awards?.includes(a))) return false;
                }

                // Award Categories Filter
                if (filters.awardCategories && filters.awardCategories.length > 0) {
                    if (!item.awardCategories || !filters.awardCategories.some(c => item.awardCategories?.includes(c))) return false;
                }
            }

            return true;
        });

        // Sort Logic
        return results.sort((a, b) => {
            if (sortOption === 'relevance') return 0;

            const [field, direction] = sortOption.split('_');
            const isDesc = direction === 'desc';

            const valA = field === 'rating' ? (a.rating || 0)
                : field === 'popularity' ? (a.popularity || 0)
                    : field === 'date' ? new Date(a.releaseDate || '1900').getTime()
                        : field === 'votes' ? (a.voteCount || 0)
                            : 0;

            const valB = field === 'rating' ? (b.rating || 0)
                : field === 'popularity' ? (b.popularity || 0)
                    : field === 'date' ? new Date(b.releaseDate || '1900').getTime()
                        : field === 'votes' ? (b.voteCount || 0)
                            : 0;

            return isDesc ? valB - valA : valA - valB;
        });

    }, [query, activeMediaType, isAdvanced, filters, sortOption, hasAppliedFilters]);


    const handleSearch = (newQuery: string) => {
        setQuery(newQuery);
    };

    const handleRecentSelect = (q: string) => {
        setQuery(q);
    };

    const clearRecent = () => setRecentSearches([]);
    const removeRecent = (q: string) => setRecentSearches(prev => prev.filter(s => s !== q));


    return (
        <div className="min-h-screen bg-black text-white pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto pt-8 flex flex-col items-center">

                {/* Sticky Search Bar */}
                <div className="w-full max-w-3xl sticky top-4 z-50">
                    <SearchBar
                        value={query}
                        onChange={handleSearch}
                        onClear={() => setQuery('')}
                    />
                </div>

                {/* Switches - Non sticky */}
                <div className="w-full max-w-3xl space-y-4 mt-6">
                    <MediaTypeSwitch
                        activeType={activeMediaType}
                        onChange={setActiveMediaType}
                        isAdvanced={isAdvanced}
                    />
                    <ModeSwitch isAdvanced={isAdvanced} onToggle={handleModeToggle} />
                </div>

                {/* Content Area */}
                <div className="w-full mt-8">
                    {isAdvanced && (
                        <>
                            {/* Filter Section Toggle Header (Only when collapsed) */}
                            {isFiltersCollapsed && (
                                <div className="flex justify-center mb-6">
                                    <button
                                        onClick={() => setIsFiltersCollapsed(false)}
                                        className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-6 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        Advanced Filters applied
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Full Filter Section (Collapsible) */}
                            <AnimatePresence>
                                {!isFiltersCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <AdvancedFilters
                                            filters={filters}
                                            onChange={setFilters}
                                            onReset={() => {
                                                setFilters({ query: '', mediaTypes: [activeMediaType] });
                                                setSortOption('relevance');
                                            }}
                                            onApply={handleApplyFilters}
                                            activeMediaType={activeMediaType}
                                        />
                                        {/* "Collapse" button if user wants to close without applying? 
                                            Or just reuse "Apply" as the way to close. 
                                            Or a generic "Collapse" up arrow. 
                                        */}
                                        {hasAppliedFilters && (
                                            <div className="flex justify-center mt-4">
                                                <button
                                                    onClick={() => setIsFiltersCollapsed(true)}
                                                    className="text-neutral-500 hover:text-white flex items-center gap-1 text-sm"
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                    Collapse Filters
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                    {!isAdvanced && !query && (
                        <RecentSearches
                            searches={recentSearches}
                            onSelect={handleRecentSelect}
                            onClear={clearRecent}
                            onRemove={removeRecent}
                        />
                    )}

                    {/* Results Section */}
                    {((!isAdvanced && query) || (isAdvanced && hasAppliedFilters)) && (
                        <div className="w-full max-w-6xl mx-auto mt-8">
                            {/* Only show Sort control if we have results */}
                            {filteredResults.length > 0 && (
                                <SortControl value={sortOption} onChange={setSortOption} />
                            )}

                            <SearchResults results={filteredResults} isLoading={false} />

                            {/* No Results Message */}
                            {filteredResults.length === 0 && (
                                <div className="text-center text-neutral-500 mt-12">
                                    No results match your filters.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
