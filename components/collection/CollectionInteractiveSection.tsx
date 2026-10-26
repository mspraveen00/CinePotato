'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CollectionDetail, DetailedCollectionMovie } from '@/types/collection';
import { getResizedImage } from '@/lib/image-utils';
import {
    Film,
    BarChart3,
    Users,
    Image as ImageIcon,
    CheckCircle2,
    Circle,
    Calendar,
    Clock,
    DollarSign,
    Star,
    ArrowUpDown,
    LayoutGrid,
    List,
    ExternalLink,
    X,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Clapperboard,
} from 'lucide-react';

interface CollectionInteractiveSectionProps {
    collection: CollectionDetail;
}

type TabType = 'timeline' | 'analytics' | 'cast' | 'gallery';
type SortType = 'chronological' | 'newest' | 'rating' | 'boxoffice' | 'runtime';
type ViewType = 'timeline' | 'grid';

export default function CollectionInteractiveSection({ collection }: CollectionInteractiveSectionProps) {
    const [activeTab, setActiveTab] = useState<TabType>('timeline');
    const [sortOption, setSortOption] = useState<SortType>('chronological');
    const [viewMode, setViewMode] = useState<ViewType>('timeline');

    // Marathon Tracker (persisted in localStorage)
    const [watchedIds, setWatchedIds] = useState<number[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(`cinepotato_watched_collection_${collection.id}`);
            if (saved) {
                setWatchedIds(JSON.parse(saved));
            }
        } catch {
            // Ignore localStorage errors
        }
        setIsLoaded(true);
    }, [collection.id]);

    const toggleWatched = (movieId: number) => {
        setWatchedIds(prev => {
            const next = prev.includes(movieId)
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId];
            try {
                localStorage.setItem(`cinepotato_watched_collection_${collection.id}`, JSON.stringify(next));
            } catch {
                // Ignore localStorage errors
            }
            return next;
        });
    };

    const markAllWatched = () => {
        const allIds = collection.parts.map(p => p.id);
        setWatchedIds(allIds);
        try {
            localStorage.setItem(`cinepotato_watched_collection_${collection.id}`, JSON.stringify(allIds));
        } catch {}
    };

    const resetWatched = () => {
        setWatchedIds([]);
        try {
            localStorage.removeItem(`cinepotato_watched_collection_${collection.id}`);
        } catch {}
    };

    // Calculate Marathon progress
    const watchedCount = watchedIds.length;
    const totalCount = collection.parts.length;
    const watchedPercentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

    const remainingRuntimeMinutes = useMemo(() => {
        return collection.parts
            .filter(p => !watchedIds.includes(p.id))
            .reduce((sum, p) => sum + (p.runtime || 0), 0);
    }, [collection.parts, watchedIds]);

    const formatRemainingHours = (mins: number) => {
        const hrs = Math.floor(mins / 60);
        const m = mins % 60;
        if (hrs === 0) return `${m}m remaining`;
        return `${hrs}h ${m}m remaining`;
    };

    // Sorting movies
    const sortedParts = useMemo(() => {
        const parts = [...collection.parts];
        switch (sortOption) {
            case 'chronological':
                return parts.sort((a, b) => {
                    if (!a.releaseDate) return 1;
                    if (!b.releaseDate) return -1;
                    return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                });
            case 'newest':
                return parts.sort((a, b) => {
                    if (!a.releaseDate) return 1;
                    if (!b.releaseDate) return -1;
                    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                });
            case 'rating':
                return parts.sort((a, b) => b.rating - a.rating);
            case 'boxoffice':
                return parts.sort((a, b) => b.revenue - a.revenue);
            case 'runtime':
                return parts.sort((a, b) => b.runtime - a.runtime);
            default:
                return parts;
        }
    }, [collection.parts, sortOption]);

    // Lightbox modal state for Gallery tab
    const [galleryFilter, setGalleryFilter] = useState<'all' | 'posters' | 'backdrops'>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const activeGalleryImages = useMemo(() => {
        if (galleryFilter === 'posters') {
            return collection.images.posters.map(img => ({ url: img.filePath, type: 'Poster' }));
        }
        if (galleryFilter === 'backdrops') {
            return collection.images.backdrops.map(img => ({ url: img.filePath, type: 'Backdrop' }));
        }
        return [
            ...collection.images.backdrops.map(img => ({ url: img.filePath, type: 'Backdrop' })),
            ...collection.images.posters.map(img => ({ url: img.filePath, type: 'Poster' })),
        ];
    }, [collection.images, galleryFilter]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLightboxIndex(null);
            } else if (e.key === 'ArrowLeft') {
                setLightboxIndex(prev => (prev === null || prev === 0 ? activeGalleryImages.length - 1 : prev - 1));
            } else if (e.key === 'ArrowRight') {
                setLightboxIndex(prev => (prev === null || prev === activeGalleryImages.length - 1 ? 0 : prev + 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [lightboxIndex, activeGalleryImages.length]);

    // Max revenue for comparison bar chart
    const maxRevenue = useMemo(() => {
        return Math.max(...collection.parts.map(p => p.revenue), 1);
    }, [collection.parts]);

    return (
        <div id="collection-content" className="container mx-auto px-4 md:px-8 mt-10 md:mt-12 space-y-8">
            {/* Marathon Progress Card */}
            <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                            <Clapperboard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                Franchise Marathon Tracker
                                <span className="text-xs font-normal text-neutral-400">
                                    ({watchedCount} of {totalCount} watched)
                                </span>
                            </h3>
                            <p className="text-xs text-neutral-400">
                                {watchedPercentage === 100 ? (
                                    <span className="text-emerald-400 font-semibold">🎉 Marathon Complete! You've watched every film in this franchise!</span>
                                ) : (
                                    <span>{formatRemainingHours(remainingRuntimeMinutes)} left to finish the marathon</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                        {watchedCount < totalCount ? (
                            <button
                                onClick={markAllWatched}
                                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                            >
                                Mark All Watched
                            </button>
                        ) : (
                            <button
                                onClick={resetWatched}
                                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                            >
                                Reset Progress
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-950 rounded-full h-2.5 overflow-hidden border border-neutral-800">
                    <div
                        className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${watchedPercentage}%` }}
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === 'timeline'
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                            : 'bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                >
                    <Film className="w-4 h-4" />
                    <span>Timeline & Films ({collection.parts.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === 'analytics'
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                            : 'bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    <span>Financials & Ratings</span>
                </button>

                <button
                    onClick={() => setActiveTab('cast')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === 'cast'
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                            : 'bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Recurring Cast & Crew ({collection.recurringCast.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === 'gallery'
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                            : 'bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>Posters & Backdrops ({collection.images.posters.length + collection.images.backdrops.length})</span>
                </button>
            </div>

            {/* TAB 1: FILMS & TIMELINE */}
            {activeTab === 'timeline' && (
                <div className="space-y-6">
                    {/* View & Sort Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
                        {/* Sort Selector */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400">
                            <ArrowUpDown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span>Sort By:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { id: 'chronological', label: 'Chronological' },
                                    { id: 'newest', label: 'Newest' },
                                    { id: 'rating', label: 'Top Rated' },
                                    { id: 'boxoffice', label: 'Box Office' },
                                    { id: 'runtime', label: 'Runtime' },
                                ].map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSortOption(s.id as SortType)}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                            sortOption === s.id
                                                ? 'bg-amber-400 text-black'
                                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 self-end sm:self-center">
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`p-1.5 rounded-md text-xs flex items-center gap-1 font-medium transition-all ${
                                    viewMode === 'timeline'
                                        ? 'bg-neutral-800 text-white'
                                        : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                                title="Detailed Timeline View"
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden md:inline">Detailed</span>
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md text-xs flex items-center gap-1 font-medium transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-neutral-800 text-white'
                                        : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                                title="Compact Poster Grid"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="hidden md:inline">Grid</span>
                            </button>
                        </div>
                    </div>

                    {/* DETAILED TIMELINE VIEW */}
                    {viewMode === 'timeline' ? (
                        <div className="space-y-4 relative">
                            {sortedParts.map((movie, index) => {
                                const isWatched = watchedIds.includes(movie.id);

                                return (
                                    <div
                                        key={movie.id}
                                        className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                                            isWatched
                                                ? 'bg-neutral-900/30 border-neutral-800/60'
                                                : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:shadow-xl'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row gap-5 p-4 sm:p-5">
                                            {/* Poster & Rank number */}
                                            <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2">
                                                <div className="relative w-24 sm:w-32 md:w-36 aspect-[2/3] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex-shrink-0">
                                                    {movie.posterPath ? (
                                                        <img
                                                            src={getResizedImage(movie.posterPath, 'thumbnail')}
                                                            alt={movie.title}
                                                            className={`w-full h-full object-cover transition-transform duration-300 ${
                                                                isWatched ? 'opacity-70' : 'group-hover:scale-105'
                                                            }`}
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-neutral-500">
                                                            {movie.title}
                                                        </div>
                                                    )}

                                                    {/* Rating badge */}
                                                    {movie.rating > 0 && (
                                                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-neutral-700/60">
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                            <span className="text-xs font-bold text-white">
                                                                {movie.rating}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Watch Status Button */}
                                                <button
                                                    onClick={() => toggleWatched(movie.id)}
                                                    className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                        isWatched
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                                            : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800'
                                                    }`}
                                                >
                                                    {isWatched ? (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>Watched</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Circle className="w-3.5 h-3.5" />
                                                            <span>Mark Watched</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0 space-y-3">
                                                {/* Title, Year, and Part # */}
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                                                #{index + 1}
                                                            </span>
                                                            {movie.releaseYear && (
                                                                <span className="text-xs font-medium text-neutral-400">
                                                                    {movie.releaseYear}
                                                                </span>
                                                            )}
                                                            {movie.runtime > 0 && (
                                                                <>
                                                                    <span className="text-neutral-600">•</span>
                                                                    <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {movie.formattedRuntime}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>

                                                        <Link
                                                            href={`/movie/${movie.id}`}
                                                            className="text-lg sm:text-xl font-bold text-white hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group-hover:underline"
                                                        >
                                                            <span>{movie.title}</span>
                                                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Link>
                                                    </div>

                                                    <Link
                                                        href={`/movie/${movie.id}`}
                                                        className="self-start px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-400 hover:text-black text-neutral-200 text-xs font-semibold transition-all"
                                                    >
                                                        View Movie →
                                                    </Link>
                                                </div>

                                                {/* Overview */}
                                                {movie.overview && (
                                                    <p className="text-neutral-300 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                                                        {movie.overview}
                                                    </p>
                                                )}

                                                {/* Financials & Filmmaker Badges */}
                                                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                                    {movie.revenue > 0 && (
                                                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" />
                                                            {movie.formattedRevenue} Box Office
                                                        </span>
                                                    )}

                                                    {movie.budget > 0 && (
                                                        <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-400">
                                                            Budget: {movie.formattedBudget}
                                                        </span>
                                                    )}

                                                    {movie.director && (
                                                        <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300">
                                                            Director: <strong className="text-white">{movie.director}</strong>
                                                        </span>
                                                    )}

                                                    {movie.genres && movie.genres.length > 0 && (
                                                        <div className="hidden md:flex items-center gap-1.5 text-neutral-500">
                                                            {movie.genres.slice(0, 3).map(g => (
                                                                <span key={g} className="px-2 py-0.5 rounded bg-neutral-950 text-[11px] text-neutral-400 border border-neutral-800">
                                                                    {g}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Top Cast preview */}
                                                {movie.topCast && movie.topCast.length > 0 && (
                                                    <div className="pt-1 text-xs text-neutral-400">
                                                        <span className="text-neutral-500">Starring: </span>
                                                        {movie.topCast.map((c, i) => (
                                                            <span key={c.id}>
                                                                <Link
                                                                    href={`/person/${c.id}`}
                                                                    className="text-neutral-300 hover:text-amber-400 transition-colors"
                                                                >
                                                                    {c.name}
                                                                </Link>
                                                                {i < (movie.topCast?.length || 0) - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* COMPACT POSTER GRID VIEW */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {sortedParts.map((movie, index) => {
                                const isWatched = watchedIds.includes(movie.id);

                                return (
                                    <div
                                        key={movie.id}
                                        className="group relative flex flex-col rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all"
                                    >
                                        <Link href={`/movie/${movie.id}`} className="relative aspect-[2/3] overflow-hidden bg-neutral-950">
                                            {movie.posterPath ? (
                                                <img
                                                    src={getResizedImage(movie.posterPath, 'poster')}
                                                    alt={movie.title}
                                                    className={`w-full h-full object-cover transition-transform duration-300 ${
                                                        isWatched ? 'opacity-60' : 'group-hover:scale-105'
                                                    }`}
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-neutral-500">
                                                    {movie.title}
                                                </div>
                                            )}

                                            {/* Rank # */}
                                            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-amber-400 border border-neutral-700/60">
                                                #{index + 1}
                                            </div>

                                            {/* Rating */}
                                            {movie.rating > 0 && (
                                                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-bold text-white border border-neutral-700/60">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                    <span>{movie.rating}</span>
                                                </div>
                                            )}
                                        </Link>

                                        <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                                            <div>
                                                <Link
                                                    href={`/movie/${movie.id}`}
                                                    className="text-xs font-bold text-white hover:text-amber-400 transition-colors line-clamp-1"
                                                >
                                                    {movie.title}
                                                </Link>
                                                <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-0.5">
                                                    <span>{movie.releaseYear || 'TBA'}</span>
                                                    <span>{movie.formattedRuntime}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleWatched(movie.id)}
                                                className={`w-full py-1 rounded text-[11px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                                                    isWatched
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                                                }`}
                                            >
                                                {isWatched ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Watched</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Circle className="w-3 h-3" />
                                                        <span>Watched?</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: FINANCIALS & RATINGS ANALYTICS */}
            {activeTab === 'analytics' && (
                <div className="space-y-8">
                    {/* Visual Comparison: Box Office */}
                    <div className="p-5 md:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                                Box Office Earnings Comparison
                            </h3>
                            <span className="text-xs text-neutral-400">
                                Total: <strong className="text-emerald-400">{collection.stats.formattedRevenue}</strong>
                            </span>
                        </div>

                        <div className="space-y-3">
                            {collection.parts.map((movie) => {
                                const percentage = maxRevenue > 0 ? (movie.revenue / maxRevenue) * 100 : 0;

                                return (
                                    <div key={movie.id} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <Link
                                                href={`/movie/${movie.id}`}
                                                className="font-medium text-neutral-200 hover:text-amber-400 truncate max-w-[260px] sm:max-w-md"
                                            >
                                                {movie.title} ({movie.releaseYear})
                                            </Link>
                                            <span className="font-bold text-emerald-400">
                                                {movie.formattedRevenue}
                                            </span>
                                        </div>
                                        <div className="w-full bg-neutral-950 rounded-full h-3 overflow-hidden border border-neutral-800">
                                            <div
                                                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-700"
                                                style={{ width: `${Math.max(percentage, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ratings Comparison */}
                    <div className="p-5 md:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                TMDB Community Score Comparison
                            </h3>
                            <span className="text-xs text-neutral-400">
                                Weighted Avg: <strong className="text-amber-400">★ {collection.stats.averageRating}</strong>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {collection.parts.map((movie) => (
                                <div key={movie.id} className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <Link
                                            href={`/movie/${movie.id}`}
                                            className="text-sm font-semibold text-white hover:text-amber-400 truncate block"
                                        >
                                            {movie.title}
                                        </Link>
                                        <span className="text-xs text-neutral-500">
                                            {movie.releaseYear} • {movie.voteCount.toLocaleString()} votes
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-sm flex-shrink-0">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        <span>{movie.rating}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Financials Table */}
                    <div className="p-5 md:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-x-auto">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                            Financial Breakdown & Return on Investment
                        </h3>

                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-neutral-800 text-neutral-500">
                                    <th className="pb-3 font-semibold">Film</th>
                                    <th className="pb-3 font-semibold">Year</th>
                                    <th className="pb-3 font-semibold">Budget</th>
                                    <th className="pb-3 font-semibold">Box Office</th>
                                    <th className="pb-3 font-semibold">Multiplier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                                {collection.parts.map((movie) => {
                                    const multiplier = movie.budget > 0 && movie.revenue > 0
                                        ? (movie.revenue / movie.budget).toFixed(1) + 'x'
                                        : '—';

                                    return (
                                        <tr key={movie.id} className="hover:bg-neutral-800/30 transition-colors">
                                            <td className="py-3 font-medium text-white pr-4">
                                                <Link href={`/movie/${movie.id}`} className="hover:text-amber-400">
                                                    {movie.title}
                                                </Link>
                                            </td>
                                            <td className="py-3 text-neutral-400">{movie.releaseYear || '—'}</td>
                                            <td className="py-3 text-neutral-400">{movie.formattedBudget}</td>
                                            <td className="py-3 font-semibold text-emerald-400">{movie.formattedRevenue}</td>
                                            <td className="py-3 font-bold text-amber-400">{multiplier}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: RECURRING CAST & DIRECTORS */}
            {activeTab === 'cast' && (
                <div className="space-y-8">
                    {/* Recurring Stars */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-bold text-white">Franchise Stars & Recurring Cast</h3>
                        </div>

                        {collection.recurringCast.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {collection.recurringCast.map((actor) => (
                                    <Link
                                        key={actor.id}
                                        href={`/person/${actor.id}`}
                                        className="group p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col items-center text-center space-y-2.5"
                                    >
                                        <div className="w-20 sm:w-24 aspect-square rounded-full overflow-hidden bg-neutral-950 border-2 border-neutral-800 group-hover:border-amber-400 transition-colors">
                                            {actor.profilePath ? (
                                                <img
                                                    src={actor.profilePath}
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-600 font-bold text-xl">
                                                    {actor.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                                                {actor.name}
                                            </p>
                                            <p className="text-[11px] text-neutral-400 line-clamp-1">
                                                {actor.character}
                                            </p>
                                        </div>

                                        <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-semibold border border-amber-400/20">
                                            In {actor.filmCount} of {collection.parts.length} films
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-neutral-500 text-sm">No recurring cast data available.</p>
                        )}
                    </div>

                    {/* Directors */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Clapperboard className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-bold text-white">Franchise Directors</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {collection.directors.map((director) => (
                                <div
                                    key={director.name}
                                    className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white text-base">
                                            {director.name}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 text-xs font-semibold">
                                            {director.filmCount} {director.filmCount === 1 ? 'Film' : 'Films'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-400">
                                        Directed: <span className="text-neutral-300">{director.movieTitles.join(', ')}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: POSTERS & BACKDROPS GALLERY */}
            {activeTab === 'gallery' && (
                <div className="space-y-6">
                    {/* Gallery Filters */}
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setGalleryFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    galleryFilter === 'all'
                                        ? 'bg-amber-400 text-black'
                                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                }`}
                            >
                                All Media ({collection.images.posters.length + collection.images.backdrops.length})
                            </button>
                            <button
                                onClick={() => setGalleryFilter('posters')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    galleryFilter === 'posters'
                                        ? 'bg-amber-400 text-black'
                                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                }`}
                            >
                                Franchise Posters ({collection.images.posters.length})
                            </button>
                            <button
                                onClick={() => setGalleryFilter('backdrops')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    galleryFilter === 'backdrops'
                                        ? 'bg-amber-400 text-black'
                                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                }`}
                            >
                                Backdrops ({collection.images.backdrops.length})
                            </button>
                        </div>

                        <span className="text-xs text-neutral-500 hidden sm:inline">
                            Click to view full-resolution
                        </span>
                    </div>

                    {/* Media Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {activeGalleryImages.map((img, idx) => (
                            <button
                                key={img.url + idx}
                                onClick={() => setLightboxIndex(idx)}
                                className={`group relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 cursor-pointer text-left transition-all hover:border-amber-400/80 shadow-md ${
                                    img.type === 'Backdrop' ? 'aspect-[16/9] col-span-2' : 'aspect-[2/3]'
                                }`}
                            >
                                <img
                                    src={getResizedImage(img.url, img.type === 'Backdrop' ? 'hero' : 'poster')}
                                    alt="Collection artwork"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    decoding="async"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                    <span className="text-[11px] font-semibold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                                        {img.type}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {activeGalleryImages.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                            No collection artwork available.
                        </div>
                    )}
                </div>
            )}

            {/* LIGHTBOX MODAL */}
            {lightboxIndex !== null && activeGalleryImages[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-all"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-5 left-5 z-50 text-neutral-300 text-xs font-semibold bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800">
                        {lightboxIndex + 1} / {activeGalleryImages.length}
                    </div>

                    {/* Previous */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex(prev => (prev === null || prev === 0 ? activeGalleryImages.length - 1 : prev - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-all"
                        title="Previous (Arrow Left)"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Next */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex(prev => (prev === null || prev === activeGalleryImages.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-all"
                        title="Next (Arrow Right)"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Image */}
                    <div
                        className="max-w-5xl max-h-[85vh] flex items-center justify-center relative select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={activeGalleryImages[lightboxIndex].url}
                            alt="Franchise high resolution artwork"
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
