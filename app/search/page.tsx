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
import { searchTitles } from "@/lib/services/search-service"
import { Filter, History, SlidersHorizontal } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

function SearchPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const initialQuery = searchParams.get("q") || ""
    const activeType = (searchParams.get("type") as MediaType) || "movie"

    const [query, setQuery] = React.useState(initialQuery)
    const [mode, setMode] = React.useState<"recent" | "advanced">("recent")
    // const [showAdvanced, setShowAdvanced] = React.useState(false) // Deprecated in favor of mode
    const [sort, setSort] = React.useState<SortOption>("relevance")
    const [isLoading, setIsLoading] = React.useState(false)
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [error, setError] = React.useState<string | null>(null)

    const [recentSearches, setRecentSearches] = React.useState<string[]>([])

    // Load recent searches on mount
    React.useEffect(() => {
        const stored = localStorage.getItem("cinepotato_recent_searches")
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored))
            } catch (e) {
                // ignore
            }
        }
    }, [])

    const addRecentSearch = React.useCallback((search: string) => {
        if (!search.trim()) return;
        setRecentSearches(prev => {
            const updated = [search, ...prev.filter(s => s.toLowerCase() !== search.toLowerCase())].slice(0, 10);
            localStorage.setItem("cinepotato_recent_searches", JSON.stringify(updated));
            return updated;
        });
    }, []);

    const [filters, setFilters] = React.useState<SearchFilters>({
        query: initialQuery,
        mediaTypes: [activeType],
    })

    // Active filters that actually trigger the search
    const [activeFilters, setActiveFilters] = React.useState<SearchFilters | null>(
        initialQuery ? { query: initialQuery, mediaTypes: [activeType] } : null
    )
    const [isFiltersCollapsed, setIsFiltersCollapsed] = React.useState(false)

    const lastSyncedQueryRef = React.useRef(initialQuery)

    const setActiveType = React.useCallback((newType: MediaType) => {
        const params = new URLSearchParams(window.location.search)
        if (newType === "movie") {
            params.delete("type")
        } else {
            params.set("type", newType)
        }
        if (query.trim()) {
            params.set("q", query.trim())
        } else {
            params.delete("q")
        }
        lastSyncedQueryRef.current = query
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [pathname, router, query])

    const handleClear = React.useCallback(() => {
        setQuery("")
        lastSyncedQueryRef.current = ""
        setActiveFilters(prev => ({ ...(prev || {}), query: "", mediaTypes: [activeType] } as SearchFilters))
        setResults([])
        const params = new URLSearchParams(window.location.search)
        params.delete("q")
        const queryString = params.toString()
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname
        window.history.replaceState(null, "", newUrl)
    }, [activeType, pathname])

    const handleSelectRecent = React.useCallback((selectedQuery: string) => {
        setQuery(selectedQuery)
        addRecentSearch(selectedQuery)
        lastSyncedQueryRef.current = selectedQuery
        setActiveFilters(prev => ({ ...(prev || {}), query: selectedQuery, mediaTypes: [activeType] } as SearchFilters))
        setMode("recent")
        const params = new URLSearchParams(window.location.search)
        params.set("q", selectedQuery)
        const queryString = params.toString()
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname
        window.history.replaceState(null, "", newUrl)
    }, [activeType, addRecentSearch, pathname])

    const handleSubmit = React.useCallback((submittedQuery: string) => {
        addRecentSearch(submittedQuery)
        const trimmed = submittedQuery.trim()
        if (trimmed) {
            setActiveFilters(prev => ({ ...(prev || {}), query: trimmed, mediaTypes: [activeType] } as SearchFilters))
            setMode("recent")
        }
        if (lastSyncedQueryRef.current !== submittedQuery) {
            lastSyncedQueryRef.current = submittedQuery
            const params = new URLSearchParams(window.location.search)
            if (trimmed) {
                params.set("q", trimmed)
            } else {
                params.delete("q")
            }
            const queryString = params.toString()
            const newUrl = queryString ? `${pathname}?${queryString}` : pathname
            window.history.replaceState(null, "", newUrl)
        }
    }, [activeType, addRecentSearch, pathname])

    // Debounce query update - ONLY for global search bar
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = query.trim()
            if (activeFilters?.query !== trimmed) {
                if (trimmed) {
                    setActiveFilters(prev => ({ ...(prev || {}), query: trimmed, mediaTypes: [activeType] } as SearchFilters))
                    setMode("recent")
                } else if (activeFilters?.query) {
                    setActiveFilters(prev => ({ ...(prev || {}), query: "", mediaTypes: [activeType] } as SearchFilters))
                }
            }

            // Sync query to URL shallowly without triggering router transitions that disrupt typing
            if (lastSyncedQueryRef.current !== query) {
                lastSyncedQueryRef.current = query
                const params = new URLSearchParams(window.location.search)
                if (trimmed) {
                    params.set("q", trimmed)
                } else {
                    params.delete("q")
                }
                const queryString = params.toString()
                const newUrl = queryString ? `${pathname}?${queryString}` : pathname
                window.history.replaceState(null, "", newUrl)
            }
        }, 350)
        return () => clearTimeout(timer)
    }, [query, activeType, activeFilters?.query, pathname])

    // Keep queryRef up to date with the latest query without re-triggering effects
    const queryRef = React.useRef(query)
    React.useEffect(() => {
        queryRef.current = query
    }, [query])

    // Sync query from URL ONLY on external navigation (back/forward or external links)
    React.useEffect(() => {
        const urlQ = searchParams.get("q") || ""
        // Ignore if this matches what we already synced or if it matches current input (ignoring trailing spaces)
        if (urlQ === lastSyncedQueryRef.current || urlQ.trim() === queryRef.current.trim()) {
            return
        }
        lastSyncedQueryRef.current = urlQ
        setQuery(urlQ)
        setActiveFilters(prev => ({ ...(prev || {}), query: urlQ, mediaTypes: [activeType] } as SearchFilters))
    }, [searchParams, activeType])

    // Listen to browser popstate (back/forward history)
    React.useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search)
            const urlQ = params.get("q") || ""
            if (urlQ === lastSyncedQueryRef.current || urlQ.trim() === queryRef.current.trim()) {
                return
            }
            lastSyncedQueryRef.current = urlQ
            setQuery(urlQ)
            setActiveFilters(prev => ({ ...(prev || {}), query: urlQ, mediaTypes: [activeType] } as SearchFilters))
        }
        window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [activeType])

    // Update filters when active type changes (reset/default)
    React.useEffect(() => {
        setFilters(prev => ({ ...prev, mediaTypes: [activeType] }))
        // Auto-search when media type changes if there's already a query
        if (query) {
            setActiveFilters(prev => ({ ...(prev || {}), query, mediaTypes: [activeType] }))
            setMode("recent") // Ensure we show results when switching types with an active search
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeType])

    const handleApplyFilters = () => {
        setActiveFilters(filters)
        setIsFiltersCollapsed(true)
    }

    // Mock Search Effect
    React.useEffect(() => {
        let isCancelled = false

        const performSearch = async () => {
            // Only search if we have active filters OR a global query
            if (!activeFilters && !query) {
                setResults([])
                return
            }

            const currentFilters = activeFilters || { query, mediaTypes: [activeType] }
            const searchQuery = (currentFilters.query || query).trim()

            if (!searchQuery) {
                setResults([])
                return
            }

            setError(null)
            setIsLoading(true)

            try {
                const typeToSearch = currentFilters.mediaTypes?.[0] || activeType
                const searchResults = await searchTitles(searchQuery, typeToSearch)

                if (isCancelled) return

                const filteredResults = searchResults.filter(item => {
                    if (item.mediaType !== typeToSearch) return false

                    // Apply Advanced Filters
                    if (currentFilters.minRating && (item.rating || 0) < currentFilters.minRating) return false

                    if (currentFilters.genres && currentFilters.genres.length > 0) {
                        if (!item.genreIds || !currentFilters.genres.some(g => item.genreIds!.includes(g))) return false
                    }

                    if (currentFilters.releaseDecade) {
                        if (!item.releaseDate) return false
                        const year = parseInt(item.releaseDate.split('-')[0])
                        if (currentFilters.releaseYear) {
                            if (year !== currentFilters.releaseYear) return false
                        } else {
                            if (year < currentFilters.releaseDecade || year >= currentFilters.releaseDecade + 10) return false
                        }
                    } else if (currentFilters.releaseYear) {
                        if (!item.releaseDate) return false
                        const year = parseInt(item.releaseDate.split('-')[0])
                        if (year !== currentFilters.releaseYear) return false
                    }

                    if (currentFilters.minVotes && (item.voteCount || 0) < currentFilters.minVotes) return false

                    return true
                })

                setResults(filteredResults)
            } catch (error: any) {
                if (isCancelled) return
                console.error("Search failed", error)
                setError(error.message || "An unexpected error occurred while searching.")
                setResults([])
            } finally {
                if (!isCancelled) {
                    setIsLoading(false)
                }
            }
        }

        performSearch()

        return () => {
            isCancelled = true
        }
    }, [activeFilters, sort]) // Removed 'filters' and 'activeType' from dependency to stop auto-search on UI change

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header / Search Area */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 pb-4 pt-4 px-4">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    onSubmit={handleSubmit}
                    onClear={handleClear}
                />
                <div className="absolute top-full left-0 right-0 h-4 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
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
                        onSelect={handleSelectRecent}
                        onClear={() => {
                            setRecentSearches([])
                            localStorage.removeItem("cinepotato_recent_searches")
                        }}
                        onRemove={(q) => {
                            setRecentSearches(prev => {
                                const updated = prev.filter(s => s !== q)
                                localStorage.setItem("cinepotato_recent_searches", JSON.stringify(updated))
                                return updated
                            })
                        }}
                    />
                )}

                {mode === "advanced" && (
                    <AdvancedFilters
                        filters={filters}
                        onChange={setFilters}
                        onReset={() => setFilters({ query, mediaTypes: [activeType] })}
                        onApply={handleApplyFilters}
                        activeMediaType={activeType}
                    />
                )}

                {/* Results Section */}
                {(query || results.length > 0 || error) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {error ? (
                            <div className="text-center py-12">
                                <div className="text-red-500 mb-2">Search Error</div>
                                <div className="text-neutral-400">{error}</div>
                            </div>
                        ) : (
                            <>
                                {results.length > 0 && <SortControl value={sort} onChange={setSort} />}
                                <SearchResults
                                    results={results}
                                    isLoading={isLoading}
                                    onResultClick={() => query && addRecentSearch(query)}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SearchPageContent />
        </React.Suspense>
    )
}
