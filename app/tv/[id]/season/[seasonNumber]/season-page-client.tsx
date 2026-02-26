'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star, Calendar, Clock, Play, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { getResizedImage } from '@/lib/image-utils';

export default function SeasonPageClient({
    id, titleDetail, episodes, seasonName, heroBackdrop, posterUrl, prevSeason, nextSeason, currentSeason
}: any) {
    const { scrollY } = useScroll();

    // Smooth 250-350ms feel for collapse
    const headerOpacity = useTransform(scrollY, [0, 250], [0, 1]);
    const headerY = useTransform(scrollY, [0, 250], [-20, 0]);
    // Context Menu hides when header shows
    const contextMenuOpacity = useTransform(scrollY, [0, 150], [1, 0]);

    return (
        <main className="min-h-[100dvh] bg-black text-white pb-24 overflow-x-hidden relative">

            {/* Context Menu / 3-Dots */}
            <motion.div
                className="absolute top-4 right-4 md:top-6 md:right-6 z-40"
                style={{ opacity: contextMenuOpacity, y: headerY }}
            >
                <button
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800/50 backdrop-blur-md border border-neutral-600/50 text-white hover:bg-neutral-700/80 hover:border-neutral-500 transition-all pointer-events-auto"
                    title="More Options"
                >
                    <MoreVertical size={20} className="hover:text-primary transition-colors" />
                </button>
            </motion.div>

            {/* Sticky Header (Hidden initially) */}
            <motion.div
                style={{ opacity: headerOpacity, y: headerY }}
                className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex flex-row items-center justify-between"
            >
                <Link
                    href={`/tv/${id}`}
                    className="inline-flex items-center gap-2 p-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors pointer-events-auto"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 text-center truncate px-4">
                    <h2 className="text-lg font-bold text-white truncate">{titleDetail.title} - {seasonName}</h2>
                </div>
                <div className="w-9" /> {/* Spacer for centering */}
            </motion.div>

            {/* Cinematic Hero Section */}
            <div className="relative w-full h-[50dvh] min-h-[400px] flex flex-col justify-end">
                {/* Background Image with Gradient Fade */}
                <div className="absolute inset-0 overflow-hidden">
                    {heroBackdrop ? (
                        <img
                            src={getResizedImage(heroBackdrop, "fullscreen")}
                            alt={seasonName}
                            className="w-full h-full object-cover opacity-50"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                </div>

                {/* Back Link */}
                <div className="absolute top-24 left-4 sm:left-8 md:left-12 z-20">
                    <Link
                        href={`/tv/${id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white hover:bg-black/60 transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to {titleDetail.title}</span>
                    </Link>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-8 flex flex-col md:flex-row gap-8 items-end">
                    {posterUrl && (
                        <div className="hidden md:block w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 flex-shrink-0 relative z-20 transform translate-y-12">
                            <img src={posterUrl} alt={seasonName} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="flex-1 space-y-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-2xl">
                            {seasonName}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/5 text-white shadow-sm">
                                {episodes.length} Episodes
                            </span>
                            {currentSeason?.airDate && (
                                <span className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/5 text-neutral-300 shadow-sm">
                                    Premiered {new Date(currentSeason.airDate).getFullYear()}
                                </span>
                            )}
                        </div>

                        {currentSeason?.overview && (
                            <p className="text-neutral-300 text-lg max-w-3xl leading-relaxed drop-shadow-md">
                                {currentSeason.overview}
                            </p>
                        )}

                        {/* Navigation Buttons for Quick Jump */}
                        <div className="flex items-center gap-4 pt-4 pb-2">
                            {prevSeason && (
                                <Link
                                    href={`/tv/${id}/season/${prevSeason.seasonNumber}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white transition-colors"
                                    title={prevSeason.name}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="font-medium text-sm">Previous Season</span>
                                </Link>
                            )}
                            {nextSeason && (
                                <Link
                                    href={`/tv/${id}/season/${nextSeason.seasonNumber}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-md border border-amber-500/20 text-amber-500 transition-colors ml-auto"
                                    title={nextSeason.name}
                                >
                                    <span className="font-medium text-sm">Next Season</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Episodes Timeline / List */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-16 md:mt-24 relative">
                {/* Subdued vertical timeline line (desktop only) */}
                <div className="hidden md:block absolute left-[83px] sm:left-[99px] top-6 bottom-0 w-px bg-gradient-to-b from-neutral-800 via-neutral-800 to-transparent" />

                <div className="space-y-8 md:space-y-12">
                    {episodes.map((ep: any) => (
                        <div key={ep.id} className="relative flex flex-col md:flex-row gap-4 md:gap-10 group">

                            {/* Timeline Node (desktop) */}
                            <div className="hidden md:flex flex-col items-center relative z-10 mt-8">
                                <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border-2 border-neutral-800 flex items-center justify-center text-neutral-400 font-bold group-hover:bg-neutral-900 group-hover:border-amber-500/50 group-hover:text-amber-500 transition-colors shadow-black/50 shadow-xl relative z-10">
                                    {ep.episodeNumber}
                                </div>
                                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                            </div>

                            {/* Card Content */}
                            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-5 bg-neutral-900/40 backdrop-blur-xl hover:bg-neutral-800/60 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl overflow-hidden relative">

                                {/* Ambient glow behind card */}
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* Thumbnail Container */}
                                <div className="w-full lg:w-80 flex-shrink-0 relative rounded-2xl overflow-hidden aspect-video bg-neutral-950 border border-neutral-800/50 group-hover:border-neutral-700/80 transition-colors">
                                    {ep.stillPath ? (
                                        <img
                                            src={ep.stillPath}
                                            alt={ep.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-700 text-sm font-medium">
                                            No Image
                                        </div>
                                    )}

                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                        <div className="w-14 h-14 rounded-full bg-amber-500/90 text-black flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl shadow-amber-500/20">
                                            <Play className="w-6 h-6 ml-1 fill-current" />
                                        </div>
                                    </div>

                                    {/* Mobile Episode Badge */}
                                    <div className="md:hidden absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-sm font-bold text-white shadow-lg border border-white/10">
                                        E{ep.episodeNumber}
                                    </div>
                                </div>

                                {/* Text Info */}
                                <div className="flex-1 flex flex-col py-1 relative z-10 w-full min-w-0">
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-amber-500 transition-colors line-clamp-1 sm:line-clamp-none">
                                        {ep.name}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-neutral-400 mb-4 font-medium">
                                        {ep.rating > 0 && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span>{ep.rating}</span>
                                            </div>
                                        )}
                                        {ep.airDate && (
                                            <div className="flex items-center gap-1.5 bg-neutral-800/50 px-2.5 py-1 rounded-md border border-white/5">
                                                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                                                <span>{new Date(ep.airDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        )}
                                        {ep.runtime && (
                                            <div className="flex items-center gap-1.5 bg-neutral-800/50 px-2.5 py-1 rounded-md border border-white/5">
                                                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                                <span>{ep.runtime}m</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-neutral-300 leading-relaxed text-[15px] sm:text-base line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                                        {ep.overview || "No plot overview available."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Navigation Buttons */}
                {(prevSeason || nextSeason) && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-white/5">
                        {prevSeason ? (
                            <Link
                                href={`/tv/${id}/season/${prevSeason.seasonNumber}`}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-neutral-900/50 hover:bg-neutral-800/80 border border-white/5 transition-all group"
                            >
                                <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:-translate-x-1 transition-transform" />
                                <div className="text-left">
                                    <div className="text-xs text-neutral-500 font-medium">Previous</div>
                                    <div className="font-semibold">{prevSeason.name || `Season ${prevSeason.seasonNumber}`}</div>
                                </div>
                            </Link>
                        ) : <div className="hidden sm:block" />}

                        {nextSeason && (
                            <Link
                                href={`/tv/${id}/season/${nextSeason.seasonNumber}`}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-neutral-900/50 hover:bg-neutral-800/80 border border-white/5 transition-all group ml-auto"
                            >
                                <div className="text-right">
                                    <div className="text-xs text-neutral-500 font-medium">Next</div>
                                    <div className="font-semibold text-amber-500">{nextSeason.name || `Season ${nextSeason.seasonNumber}`}</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
