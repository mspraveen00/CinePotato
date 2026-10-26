import React from 'react';
import { CollectionStats } from '@/types/collection';
import { DollarSign, Clock, Star, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface CollectionStatsBarProps {
    stats: CollectionStats;
}

export default function CollectionStatsBar({ stats }: CollectionStatsBarProps) {
    return (
        <section className="container mx-auto px-4 md:px-8 -mt-6 relative z-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 p-4 md:p-6 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-2xl shadow-black/60">
                {/* 1. Total Box Office */}
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Total Box Office</span>
                    </div>
                    <div className="text-xl md:text-2xl font-black text-emerald-400 tracking-tight">
                        {stats.formattedRevenue !== 'N/A' ? stats.formattedRevenue : '—'}
                    </div>
                    <span className="text-[11px] text-neutral-500 truncate">
                        {stats.formattedBudget !== 'N/A' ? `Budget: ${stats.formattedBudget}` : 'Budget not reported'}
                    </span>
                </div>

                {/* 2. Marathon Runtime */}
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Marathon Runtime</span>
                    </div>
                    <div className="text-xl md:text-2xl font-black text-white tracking-tight">
                        {stats.formattedTotalRuntime}
                    </div>
                    <span className="text-[11px] text-neutral-500 truncate">
                        {stats.formattedAverageRuntime !== '0m' ? `Avg: ${stats.formattedAverageRuntime} / film` : `${stats.totalFilms} films`}
                    </span>
                </div>

                {/* 3. Franchise Rating */}
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Franchise Rating</span>
                    </div>
                    <div className="text-xl md:text-2xl font-black text-amber-400 tracking-tight flex items-baseline gap-1">
                        {stats.averageRating > 0 ? stats.averageRating : '—'}
                        <span className="text-xs text-neutral-500 font-normal">/ 10</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 truncate">
                        Weighted user score
                    </span>
                </div>

                {/* 4. Highest Grossing Film */}
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                        <Trophy className="w-3.5 h-3.5 text-amber-300" />
                        <span>Highest Earner</span>
                    </div>
                    {stats.highestGrossingFilm ? (
                        <>
                            <Link
                                href={`/movie/${stats.highestGrossingFilm.id}`}
                                className="text-sm md:text-base font-bold text-white hover:text-amber-400 transition-colors line-clamp-1"
                                title={stats.highestGrossingFilm.title}
                            >
                                {stats.highestGrossingFilm.title}
                            </Link>
                            <span className="text-[11px] text-emerald-400 font-semibold truncate">
                                {stats.highestGrossingFilm.formattedRevenue} worldwide
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-neutral-500">—</span>
                    )}
                </div>

                {/* 5. Highest Rated Film */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Highest Rated</span>
                    </div>
                    {stats.highestRatedFilm ? (
                        <>
                            <Link
                                href={`/movie/${stats.highestRatedFilm.id}`}
                                className="text-sm md:text-base font-bold text-white hover:text-amber-400 transition-colors line-clamp-1"
                                title={stats.highestRatedFilm.title}
                            >
                                {stats.highestRatedFilm.title}
                            </Link>
                            <span className="text-[11px] text-amber-400 font-semibold truncate">
                                ★ {stats.highestRatedFilm.rating} score
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-neutral-500">—</span>
                    )}
                </div>
            </div>
        </section>
    );
}
