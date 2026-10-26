'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CollectionDetail } from '@/types/collection';
import { getResizedImage } from '@/lib/image-utils';
import { Play, Share2, Check, Clock, Calendar, Star, Layers, Film } from 'lucide-react';

interface CollectionHeroProps {
    collection: CollectionDetail;
}

export default function CollectionHero({ collection }: CollectionHeroProps) {
    const [copied, setCopied] = useState(false);

    const firstMovie = collection.parts[0];

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: collection.name,
                    text: `Explore the complete ${collection.name} on CinePotato!`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const scrollToContent = () => {
        const el = document.getElementById('collection-content');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative w-full min-h-[520px] md:min-h-[580px] lg:min-h-[640px] flex items-end pb-12 pt-28 overflow-hidden bg-neutral-950">
            {/* Full-bleed Backdrop Background */}
            {collection.backdropPath ? (
                <div className="absolute inset-0 z-0">
                    <img
                        src={getResizedImage(collection.backdropPath, 'hero')}
                        alt={collection.name}
                        className="w-full h-full object-cover object-center opacity-40 scale-105 filter blur-[0.5px]"
                        loading="eager"
                        decoding="async"
                    />
                    {/* Multi-layer cinema vignette gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-neutral-900" />
            )}

            {/* Hero Content */}
            <div className="container mx-auto px-4 md:px-8 relative z-10 w-full">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
                    {/* Collection Poster */}
                    <div className="flex-shrink-0 group relative">
                        <div className="w-44 sm:w-52 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-neutral-800 bg-neutral-900 relative">
                            {collection.posterPath ? (
                                <img
                                    src={getResizedImage(collection.posterPath, 'poster')}
                                    alt={collection.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="eager"
                                    decoding="async"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-neutral-500">
                                    <Layers className="w-12 h-12 mb-2 text-neutral-600" />
                                    <span className="text-sm font-semibold">{collection.name}</span>
                                </div>
                            )}

                            {/* Film Count Corner Badge */}
                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-700/80 flex items-center gap-1.5 shadow-lg">
                                <Film className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-xs font-bold text-white">
                                    {collection.stats.totalFilms} Films
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Collection Details */}
                    <div className="flex-1 min-w-0 text-center md:text-left space-y-4">
                        {/* Eyebrow Label */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                            <Layers className="w-3.5 h-3.5" />
                            Franchise Collection
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                            {collection.name}
                        </h1>

                        {/* Quick Metadata Badges */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-4 text-xs sm:text-sm text-neutral-300">
                            {collection.stats.releaseSpan !== 'N/A' && (
                                <div className="flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-800">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    <span>{collection.stats.releaseSpan}</span>
                                </div>
                            )}

                            {collection.stats.formattedTotalRuntime !== '0m' && (
                                <div className="flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-800">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    <span className="font-medium text-white">{collection.stats.formattedTotalRuntime} Marathon</span>
                                </div>
                            )}

                            {collection.stats.averageRating > 0 && (
                                <div className="flex items-center gap-1.5 bg-amber-500/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-300 font-semibold">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span>{collection.stats.averageRating} Avg Rating</span>
                                </div>
                            )}
                        </div>

                        {/* Overview / Synopsis */}
                        {collection.overview && (
                            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-3xl line-clamp-3 md:line-clamp-4 text-pretty">
                                {collection.overview}
                            </p>
                        )}

                        {/* Hero CTAs */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                            {firstMovie && (
                                <Link
                                    href={`/movie/${firstMovie.id}`}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/25 active:scale-95"
                                >
                                    <Play className="w-4 h-4 fill-black" />
                                    Start Marathon ({firstMovie.releaseYear || 'Part 1'})
                                </Link>
                            )}

                            <button
                                onClick={scrollToContent}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 font-medium text-sm transition-all active:scale-95"
                            >
                                <Film className="w-4 h-4 text-amber-400" />
                                Browse Films
                            </button>

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 font-medium text-sm transition-all active:scale-95"
                                title="Share Collection"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" />
                                        <span>Share</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
