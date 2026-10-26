'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Star, Calendar, Clock, Film, Sparkles, Tv, Play, Images } from 'lucide-react';
import HeroBanner from '@/components/title/HeroBanner';
import WatchProvidersSection from '@/components/title/WatchProvidersSection';
import BackdropGallery from '@/components/title/BackdropGallery';
import TrailerModal from '@/components/title/TrailerModal';
import { EpisodeDetail } from '@/types/title';
import { getResizedImage } from '@/lib/image-utils';

interface EpisodePageClientProps {
    episodeDetail: EpisodeDetail;
}

export default function EpisodePageClient({ episodeDetail }: EpisodePageClientProps) {
    const {
        seriesId,
        seriesTitle,
        seasonNumber,
        episodeNumber,
        seasonName,
        guestStars,
        regularCast,
        crew,
        stills,
        seasonEpisodes,
        prevEpisode,
        nextEpisode,
        watchProviders,
        trailers,
    } = episodeDetail;

    // Gallery state for Stills section
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    // Trailer modal state
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    const hasStills = stills && stills.length > 0;
    const hasTrailers = trailers && trailers.length > 0;

    return (
        <main className="min-h-screen bg-black text-white pb-24 overflow-x-hidden">
            {/* Cinematic Hero Banner */}
            <HeroBanner titleDetail={episodeDetail} />

            <div className="container mx-auto px-4 relative z-10 mt-12">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Space for the floating poster on desktop */}
                    <div className="hidden md:block w-64 flex-shrink-0" />

                    <div className="flex-1 min-w-0 space-y-12">

                        {/* Plot Summary & Episode Info Badges */}
                        <section className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                    <span>Plot Summary</span>
                                </h3>
                                {episodeDetail.episodeType && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {episodeDetail.episodeType.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>

                            <p className="text-neutral-300 leading-relaxed text-base sm:text-lg max-w-3xl">
                                {episodeDetail.overview || "No plot overview available for this episode."}
                            </p>

                            {/* Detailed Info Chips */}
                            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
                                <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-300">
                                    <Tv className="w-4 h-4 text-amber-500" />
                                    <span>Season {seasonNumber}, Episode {episodeNumber}</span>
                                </div>

                                {episodeDetail.airDate && (
                                    <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-300">
                                        <Calendar className="w-4 h-4 text-neutral-400" />
                                        <span>
                                            {new Date(episodeDetail.airDate).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}

                                {episodeDetail.runtime && episodeDetail.runtime !== 'N/A' && (
                                    <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-300">
                                        <Clock className="w-4 h-4 text-neutral-400" />
                                        <span>{episodeDetail.runtime}</span>
                                    </div>
                                )}

                                {episodeDetail.productionCode && (
                                    <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-400">
                                        <Film className="w-4 h-4 text-neutral-500" />
                                        <span>Prod: #{episodeDetail.productionCode}</span>
                                    </div>
                                )}

                                {hasTrailers && (
                                    <button
                                        onClick={() => setIsTrailerOpen(true)}
                                        className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-amber-400 font-medium transition-colors cursor-pointer group"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                                        <span>Watch Preview</span>
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* Quick Episode Navigation Bar (Prev / Season / Next) */}
                        <section className="bg-neutral-900/50 backdrop-blur-md rounded-2xl border border-neutral-800/80 p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Previous Episode */}
                                {prevEpisode ? (
                                    <Link
                                        href={`/tv/${seriesId}/season/${seasonNumber}/episode/${prevEpisode.episodeNumber}`}
                                        className="w-full sm:w-auto flex-1 flex items-center gap-3 p-3 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/60 border border-neutral-800/60 hover:border-neutral-700 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                                                Previous Episode
                                            </span>
                                            <span className="text-sm font-bold text-white truncate block group-hover:text-amber-400 transition-colors">
                                                E{prevEpisode.episodeNumber}. {prevEpisode.name}
                                            </span>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="hidden sm:block flex-1" />
                                )}

                                {/* Back to Season Center Button */}
                                <Link
                                    href={`/tv/${seriesId}/season/${seasonNumber}`}
                                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-all text-center whitespace-nowrap"
                                >
                                    {seasonName || `Season ${seasonNumber}`}
                                </Link>

                                {/* Next Episode */}
                                {nextEpisode ? (
                                    <Link
                                        href={`/tv/${seriesId}/season/${seasonNumber}/episode/${nextEpisode.episodeNumber}`}
                                        className="w-full sm:w-auto flex-1 flex items-center justify-end gap-3 p-3 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/60 border border-neutral-800/60 hover:border-neutral-700 transition-all group text-right"
                                    >
                                        <div className="min-w-0 text-right">
                                            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                                                Next Episode
                                            </span>
                                            <span className="text-sm font-bold text-white truncate block group-hover:text-amber-400 transition-colors">
                                                E{nextEpisode.episodeNumber}. {nextEpisode.name}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="hidden sm:block flex-1" />
                                )}
                            </div>
                        </section>

                        {/* Guest Stars (Special episode feature) */}
                        {guestStars && guestStars.length > 0 && (
                            <section className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                        <span>Guest Stars</span>
                                        <span className="text-sm font-normal text-neutral-400">({guestStars.length})</span>
                                    </h3>
                                </div>

                                <div className="carousel-mask carousel-mask-title flex gap-4 overflow-x-auto pt-2 pb-4 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]">
                                    {guestStars.map((actor) => (
                                        <Link
                                            href={`/person/${actor.id}`}
                                            key={actor.id}
                                            className="w-32 flex-shrink-0 group cursor-pointer block"
                                        >
                                            <div className="overflow-hidden rounded-xl mb-2 aspect-[2/3] bg-neutral-800 border border-neutral-800/80 group-hover:border-neutral-600 transition-all shadow-md">
                                                {actor.profileImageUrl ? (
                                                    <img
                                                        src={actor.profileImageUrl}
                                                        alt={actor.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs text-center px-2">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-sm text-neutral-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
                                                {actor.name}
                                            </p>
                                            <p className="text-xs text-neutral-400 line-clamp-2">
                                                {actor.character}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Starring Regular Cast */}
                        {regularCast && regularCast.length > 0 && (
                            <section className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                        <span>Episode Cast</span>
                                        <span className="text-sm font-normal text-neutral-400">({regularCast.length})</span>
                                    </h3>
                                </div>

                                <div className="carousel-mask carousel-mask-title flex gap-4 overflow-x-auto pt-2 pb-4 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]">
                                    {regularCast.map((actor) => (
                                        <Link
                                            href={`/person/${actor.id}`}
                                            key={actor.id}
                                            className="w-32 flex-shrink-0 group cursor-pointer block"
                                        >
                                            <div className="overflow-hidden rounded-xl mb-2 aspect-[2/3] bg-neutral-800 border border-neutral-800/80 group-hover:border-neutral-600 transition-all shadow-md">
                                                {actor.profileImageUrl ? (
                                                    <img
                                                        src={actor.profileImageUrl}
                                                        alt={actor.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs text-center px-2">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-sm text-neutral-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
                                                {actor.name}
                                            </p>
                                            <p className="text-xs text-neutral-400 line-clamp-2">
                                                {actor.character}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Episode Crew */}
                        {crew && crew.length > 0 && (
                            <section className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                        <span>Directed & Written By</span>
                                    </h3>
                                </div>

                                <div className="carousel-mask carousel-mask-title flex gap-4 overflow-x-auto pt-2 pb-4 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]">
                                    {crew.map((member) => (
                                        <Link
                                            href={`/person/${member.id}`}
                                            key={`${member.id}-${member.job}`}
                                            className="w-32 flex-shrink-0 group cursor-pointer block"
                                        >
                                            <div className="overflow-hidden rounded-xl mb-2 aspect-[2/3] bg-neutral-800 border border-neutral-800/80 group-hover:border-neutral-600 transition-all shadow-md">
                                                {member.profileImageUrl ? (
                                                    <img
                                                        src={member.profileImageUrl}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs text-center px-2">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-sm text-neutral-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-neutral-400 line-clamp-2">
                                                {member.job}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Episode Stills Gallery */}
                        {hasStills && (
                            <section className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                            <Images className="w-5 h-5 text-amber-500" />
                                            <span>Episode Stills</span>
                                        </h3>
                                        <span className="text-xs text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
                                            {stills.length} photos
                                        </span>
                                    </div>
                                    <span className="text-xs text-neutral-500 hidden sm:inline">
                                        Click any photo to open fullscreen gallery
                                    </span>
                                </div>

                                <div className="carousel-mask carousel-mask-title flex gap-4 overflow-x-auto pt-2 pb-4 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]">
                                    {stills.map((stillUrl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setGalleryIndex(idx)}
                                            className="w-64 sm:w-80 flex-shrink-0 aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/50 transition-all group cursor-pointer relative shadow-lg"
                                        >
                                            <img
                                                src={getResizedImage(stillUrl, "hero")}
                                                alt={`Still ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center">
                                                    <Images className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* All Episodes in this Season Carousel */}
                        {seasonEpisodes && seasonEpisodes.length > 0 && (
                            <section className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-white">
                                            More in {seasonName || `Season ${seasonNumber}`}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-neutral-400">
                                            Jump to other episodes in this season
                                        </p>
                                    </div>
                                    <Link
                                        href={`/tv/${seriesId}/season/${seasonNumber}`}
                                        className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                                    >
                                        <span>View Season</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                <div className="carousel-mask carousel-mask-title flex gap-4 sm:gap-5 overflow-x-auto pt-2 pb-6 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]">
                                    {seasonEpisodes.map((ep) => {
                                        const isCurrent = ep.episodeNumber === episodeNumber;
                                        return (
                                            <Link
                                                key={ep.id}
                                                href={`/tv/${seriesId}/season/${seasonNumber}/episode/${ep.episodeNumber}`}
                                                className={`group relative flex-shrink-0 w-52 sm:w-64 flex flex-col gap-2.5 p-3 rounded-2xl transition-all ${
                                                    isCurrent
                                                        ? 'bg-amber-500/10 border-2 border-amber-500/80 shadow-lg shadow-amber-500/10 pointer-events-none'
                                                        : 'bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700'
                                                }`}
                                            >
                                                {/* Thumbnail */}
                                                <div className="w-full aspect-video rounded-xl bg-neutral-950 overflow-hidden relative border border-white/5">
                                                    {ep.stillPath ? (
                                                        <img
                                                            src={ep.stillPath}
                                                            alt={ep.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                                                            No Image
                                                        </div>
                                                    )}

                                                    {/* Badge */}
                                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/10">
                                                        E{ep.episodeNumber}
                                                    </div>

                                                    {isCurrent && (
                                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-[10px] font-bold text-black uppercase tracking-wider">
                                                            Current
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Episode Info */}
                                                <div className="min-w-0">
                                                    <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-amber-400' : 'text-white group-hover:text-amber-400 transition-colors'}`}>
                                                        {ep.episodeNumber}. {ep.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                                                        {ep.rating > 0 && (
                                                            <span className="flex items-center gap-1 text-amber-500">
                                                                <Star className="w-3 h-3 fill-current" />
                                                                {ep.rating}
                                                            </span>
                                                        )}
                                                        {ep.runtime && (
                                                            <span>{ep.runtime}m</span>
                                                        )}
                                                        {ep.airDate && (
                                                            <span>• {new Date(ep.airDate).getFullYear()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Where to Watch */}
                        {watchProviders && (
                            <WatchProvidersSection
                                watchProviders={watchProviders}
                                title={seriesTitle}
                            />
                        )}

                    </div>
                </div>
            </div>

            {/* Stills Fullscreen Backdrop Gallery Modal */}
            {galleryIndex !== null && hasStills && (
                <BackdropGallery
                    images={stills}
                    initialIndex={galleryIndex}
                    onClose={() => setGalleryIndex(null)}
                />
            )}

            {/* Trailer Modal */}
            {hasTrailers && (
                <TrailerModal
                    isOpen={isTrailerOpen}
                    onClose={() => setIsTrailerOpen(false)}
                    trailers={trailers}
                    title={`${seriesTitle} - ${episodeDetail.title}`}
                />
            )}
        </main>
    );
}
