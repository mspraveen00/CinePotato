"use client"

import * as React from "react"
import { SearchBar } from "@/components/search/SearchBar"
import { MediaTypeSwitch } from "@/components/search/MediaTypeSwitch"
import { AdvancedFilters } from "@/components/search/AdvancedFilters"
import { SearchResults } from "@/components/search/SearchResults"
import { SortControl } from "@/components/search/SortControl"
import { RecentSearches } from "@/components/search/RecentSearches"
import { SearchFilters, SearchResult, MediaType, SortOption } from "@/types/search"
import { generateMockItems } from "@/lib/mock-data"
import { Filter, History, SlidersHorizontal } from "lucide-react"

export default function SearchPage() {
    const [query, setQuery] = React.useState("")
    const [activeType, setActiveType] = React.useState<MediaType>("movie")
    const [mode, setMode] = React.useState<"recent" | "advanced">("recent")
    // const [showAdvanced, setShowAdvanced] = React.useState(false) // Deprecated in favor of mode
    const [sort, setSort] = React.useState<SortOption>("relevance")
    const [isLoading, setIsLoading] = React.useState(false)
    const [results, setResults] = React.useState<SearchResult[]>([])

    const [recentSearches, setRecentSearches] = React.useState<string[]>([
        "Avatar: The Way of Water", "The Last of Us", "Elden Ring", "Christopher Nolan"
    ]) // Mock recent searches

    const [filters, setFilters] = React.useState<SearchFilters>({
        query: "",
        mediaTypes: ["movie"],
    })

    // Active filters that actually trigger the search
    const [activeFilters, setActiveFilters] = React.useState<SearchFilters | null>(null)
    const [isFiltersCollapsed, setIsFiltersCollapsed] = React.useState(false)

    // Debounce query update - ONLY for global search bar
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (activeFilters?.query !== query) {
                // For global search bar, we might want auto-search?
                // User said "In Advanced Search page...". Global search usually auto-searches.
                // Let's keep global search auto, but Advanced manual.
                // IF query changes, we update activeFilters.
                if (query) {
                    setActiveFilters(prev => ({ ...prev, query, mediaTypes: [activeType] }))
                    setMode("recent") // Switch to results view behavior if you type in global search
                }
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [query])

    // Update filters when active type changes (reset/default)
    React.useEffect(() => {
        setFilters(prev => ({ ...prev, mediaTypes: [activeType] }))
        // Do NOT update activeFilters here automatically for Advanced Mode
        // But for "Recent/Global" mode, maybe?
    }, [activeType])

    const handleApplyFilters = () => {
        setActiveFilters(filters)
        setIsFiltersCollapsed(true)
    }

    // Mock Search Effect
    React.useEffect(() => {
        const performSearch = async () => {
            // Only search if we have active filters OR a global query
            if (!activeFilters && !query) {
                setResults([])
                return
            }

            // If manual advanced search, use activeFilters.
            // If global search, use query.
            // Let's use activeFilters as the source of truth if set.
            const currentFilters = activeFilters || { query, mediaTypes: [activeType] }

            setIsLoading(true)

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800))

            // Generate mock data based on type
            // Map ShelfType to MediaType for the generator if needed, or just use the generator
            // generateMockItems takes 'movies' | 'tv' | 'games'
            let shelfType: "movies" | "tv" | "games" = "movies"
            // Use currentFilters mediaType for generation
            const typeToUse = currentFilters.mediaTypes?.[0] || activeType

            if (typeToUse === "tv") shelfType = "tv"
            if (typeToUse === "game") shelfType = "games"

            // Note: 'person' and others not covered by generateMockItems yet, defaulting to movies or empty
            if (typeToUse === "person") {
                setResults([]) // Todo: Implement person mock
                setIsLoading(false)
                return
            }

            const mockItems = generateMockItems(12, shelfType)

            const searchResults: SearchResult[] = mockItems.map(item => ({
                id: item.id,
                title: item.title,
                mediaType: typeToUse as MediaType,
                rating: item.rating,
                releaseDate: `${item.year}-01-01`,
                posterPath: item.posterUrl,
            }))

            setResults(searchResults)
            setIsLoading(false)
        }

        performSearch()
    }, [activeFilters, sort]) // Removed 'filters' and 'activeType' from dependency to stop auto-search on UI change

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header / Search Area */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 pb-4 pt-4 px-4">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    onClear={() => setQuery("")}
                />
            </div>

            {/* Scrollable Controls Area */}
            <div className="px-4 pt-6 pb-2 space-y-6">
                <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto w-full">
                    <MediaTypeSwitch
                        activeType={activeType}
                        onChange={setActiveType}
                        isAdvanced={mode === "advanced"}
                    />

                    {/* Search Mode Toggle */}
                    <div className="flex items-center bg-neutral-900 border border-white/10 rounded-full p-1 gap-1">
                        <button
                            onClick={() => setMode("recent")}
                            className={`
                                flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all
                                ${mode === "recent" ? "bg-white text-black shadow-lg" : "text-neutral-400 hover:text-white hover:bg-white/5"}
                            `}
                        >
                            <History className="w-3 h-3" />
                            Recent
                        </button>
                        <button
                            onClick={() => setMode("advanced")}
                            className={`
                                flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all
                                ${mode === "advanced" ? "bg-white text-black shadow-lg" : "text-neutral-400 hover:text-white hover:bg-white/5"}
                            `}
                        >
                            <SlidersHorizontal className="w-3 h-3" />
                            Advanced
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 max-w-6xl mx-auto pt-4 space-y-8">
                {/* Content based on Mode & Search State */}

                {mode === "recent" && !query && results.length === 0 && (
                    <RecentSearches
                        searches={recentSearches}
                        onSelect={setQuery}
                        onClear={() => setRecentSearches([])}
                        onRemove={(q) => setRecentSearches(prev => prev.filter(s => s !== q))}
                    />
                )}

                {mode === "advanced" && (
                    <AdvancedFilters
                        filters={filters}
                        onChange={setFilters}
                        onReset={() => setFilters({ query, mediaTypes: [activeType] })}
                        onApply={() => { /* Auto-applies */ }}
                        activeMediaType={activeType}
                    />
                )}

                {/* Results Section */}
                {(query || results.length > 0) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {results.length > 0 && <SortControl value={sort} onChange={setSort} />}
                        <SearchResults results={results} isLoading={isLoading} />
                    </div>
                )}
            </div>
        </div>
    )
}
