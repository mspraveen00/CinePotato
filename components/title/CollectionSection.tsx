'use client';

import React from 'react';
import Link from 'next/link';
import { CollectionInfo } from '@/types/title';
import { getResizedImage } from '@/lib/image-utils';
import { ArrowRight } from 'lucide-react';

interface CollectionSectionProps {
    collection: CollectionInfo;
    currentMovieId: string;
}

export default function CollectionSection({ collection, currentMovieId }: CollectionSectionProps) {
    const totalParts = collection.parts.length;
    const currentIndex = collection.parts.findIndex(p => String(p.id) === currentMovieId);
    const progressLabel = currentIndex !== -1 ? `${currentIndex + 1} of ${totalParts}` : `${totalParts} films`;

    return (
        <section className="relative">
            {/* Collection Banner */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/40">
                {/* Backdrop with gradient overlay */}
                {collection.backdropPath && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={getResizedImage(collection.backdropPath, "hero")}
                            alt={collection.name}
                            className="w-full h-full object-cover opacity-50"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10 p-5 md:p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] md:text-xs uppercase tracking-widest text-amber-400/80 font-semibold">
                            Part of
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-amber-400/20 to-transparent" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                            <Link
                                href={`/collection/${collection.id}`}
                                className="group/title inline-flex items-center gap-2"
                            >
                                <h3 className="text-lg md:text-xl font-bold text-white group-hover/title:text-amber-400 transition-colors">
                                    {collection.name}
                                </h3>
                                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover/title:text-amber-400 group-hover/title:translate-x-0.5 transition-all" />
                            </Link>

                            <p className="text-neutral-400 text-xs md:text-sm mt-0.5">
                                {progressLabel}
                            </p>
                        </div>

                        <Link
                            href={`/collection/${collection.id}`}
                            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-amber-400 hover:text-black text-neutral-300 text-xs font-semibold border border-neutral-700/80 transition-all shadow-sm active:scale-95"
                        >
                            <span>Explore Full Franchise</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Movie Cards */}
                    <div
                        className="carousel-mask flex gap-3 overflow-x-auto scrollbar-hide pt-3 pb-3 -mx-5 px-5 md:-mx-6 md:px-6"
                    >
                        {collection.parts.map((part) => {
                            const isCurrent = String(part.id) === currentMovieId;
                            const year = part.releaseDate ? new Date(part.releaseDate).getFullYear() : null;
                            const isFuture = part.releaseDate ? new Date(part.releaseDate) > new Date() : false;

                            return (
                                <Link
                                    href={`/movie/${part.id}`}
                                    key={part.id}
                                    className={`flex-shrink-0 group cursor-pointer block ${
                                        isCurrent ? 'w-28 md:w-32' : 'w-24 md:w-28'
                                    }`}
                                >
                                    {/* Poster */}
                                    <div className={`relative rounded-lg overflow-hidden mb-2 transition-all duration-300 ${
                                        isCurrent
                                            ? 'border-2 border-amber-400 shadow-lg shadow-amber-400/20'
                                            : 'border-2 border-neutral-800/80 group-hover:border-neutral-600'
                                    }`}>
                                        {part.posterPath ? (
                                            <img
                                                src={getResizedImage(part.posterPath, "thumbnail")}
                                                alt={part.title}
                                                className={`w-full aspect-[2/3] object-cover bg-neutral-900 transition-all duration-300 ${
                                                    isCurrent
                                                        ? ''
                                                        : isFuture
                                                            ? 'opacity-50 grayscale group-hover:opacity-80 group-hover:grayscale-0'
                                                            : 'group-hover:scale-105'
                                                }`}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="w-full aspect-[2/3] bg-neutral-800 flex items-center justify-center text-neutral-500 text-[10px] text-center px-2">
                                                {part.title}
                                            </div>
                                        )}

                                        {/* Future release badge */}
                                        {isFuture && !isCurrent && (
                                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-neutral-700/90 text-neutral-300 text-[9px] md:text-[10px] font-medium rounded-full">
                                                Upcoming
                                            </div>
                                        )}

                                        {/* Rating pill */}
                                        {part.rating > 0 && !isFuture && (
                                            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-full">
                                                <span className="text-amber-400 text-[10px]">★</span>
                                                <span className="text-white text-[10px] font-medium">{part.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <p className={`text-xs line-clamp-2 leading-tight transition-colors ${
                                        isCurrent
                                            ? 'text-white font-semibold'
                                            : 'text-neutral-400 group-hover:text-neutral-200'
                                    }`}>
                                        {part.title}
                                    </p>
                                    {year && (
                                        <p className={`text-[10px] mt-0.5 ${
                                            isCurrent ? 'text-neutral-400' : 'text-neutral-600'
                                        }`}>
                                            {year}
                                        </p>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
