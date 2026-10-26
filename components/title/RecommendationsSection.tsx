'use client';

import React from 'react';
import Link from 'next/link';
import { RecommendationItem } from '@/types/title';
import { Sparkles, Star } from 'lucide-react';

interface RecommendationsSectionProps {
    recommendations: RecommendationItem[];
    title: string;
    mediaType?: 'movie' | 'tv';
}

export default function RecommendationsSection({
    recommendations,
    title,
    mediaType = 'movie',
}: RecommendationsSectionProps) {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <section className="relative">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-amber-400/90" />
                <h3 className="text-xl font-bold text-white">More Like This</h3>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm mb-2">
                If you liked <span className="text-neutral-200 font-medium">{title}</span>, you might also like...
            </p>

            {/* Carousel Strip */}
            <div
                className="carousel-mask carousel-mask-title flex gap-4 overflow-x-auto pt-3 pb-3 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]"
            >
                {recommendations.map((rec) => {
                    const targetHref = `/${rec.mediaType || mediaType}/${rec.id}`;

                    return (
                        <Link
                            href={targetHref}
                            key={rec.id}
                            className="w-32 sm:w-36 flex-shrink-0 group cursor-pointer block"
                        >
                            {/* Poster */}
                            <div className="relative rounded-lg overflow-hidden mb-2 border border-neutral-800/80 group-hover:border-neutral-600 transition-all duration-300 shadow-md">
                                {rec.posterPath ? (
                                    <img
                                        src={rec.posterPath}
                                        alt={rec.title}
                                        className="w-full aspect-[2/3] object-cover bg-neutral-900 group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="w-full aspect-[2/3] bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs text-center px-2">
                                        {rec.title}
                                    </div>
                                )}

                                {/* Rating Pill */}
                                {rec.rating > 0 && (
                                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-black/75 backdrop-blur-sm rounded-full text-[10px] text-white">
                                        <Star size={10} className="fill-amber-400 text-amber-400" />
                                        <span className="font-semibold">{rec.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Title & Year */}
                            <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight text-neutral-300 group-hover:text-white transition-colors">
                                {rec.title}
                            </p>
                            {rec.releaseYear > 0 && (
                                <p className="text-[11px] text-neutral-500 mt-0.5">
                                    {rec.releaseYear}
                                </p>
                            )}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
