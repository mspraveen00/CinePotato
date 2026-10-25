'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { MoreVertical, Star, Play } from 'lucide-react';
import { HeroBannerProps } from '@/types/title';
import { cn } from '@/lib/utils';
import { getResizedImage } from '@/lib/image-utils';
import { IMDbIcon, TMDBLogo, MetacriticIcon, RottenTomatoesIcon, IGDBIcon } from '@/components/user/RatingIcons';
import BackdropGallery from './BackdropGallery';
import TrailerModal from './TrailerModal';
import { useUserLists } from '@/lib/store/user-lists-store';
import RatingModal, { getRatingTier } from '@/components/rating/RatingModal';

export default function HeroBanner({ titleDetail }: HeroBannerProps) {
    const {
        id,
        title,
        overview,
        backdropImages,
        posterPath,
        releaseYear,
        runtime,
        genres,
        rating,
        logos,
        posters,
        omdbRatings,
        imdbId,
        mediaType,
        trailers,
        certification,
        tagline,
    } = titleDetail;

    // Helper function to generate Rotten Tomatoes URL
    const getRottenTomatoesUrl = (titleStr: string, type?: 'movie' | 'tv' | 'game' | 'person') => {
        // Remove years in parentheses if they exist at the end e.g. "Title (2024)"
        let cleanTitle = titleStr.replace(/\(\d{4}\)$/, '').trim();

        const slug = cleanTitle
            .toLowerCase()
            .replace(/['.:&]/g, '') // remove specific special chars
            .replace(/[^a-z0-9]+/g, '_') // replace spaces and other non-alphanumeric with underscore
            .replace(/^_+|_+$/g, ''); // trim underscores

        const pathPrefix = type === 'tv' ? 'tv' : 'm';
        return `https://www.rottentomatoes.com/${pathPrefix}/${slug}`;
    };

    const [logoIndex, setLogoIndex] = useState(0);
    const hasLogos = logos && logos.length > 0;
    const currentLogo = hasLogos ? logos[logoIndex] : undefined;

    const handleLogoDoubleClick = () => {
        if (logos && logos.length > 1) {
            setLogoIndex((prev) => (prev + 1) % logos.length);
        }
    };

    const [posterIndex, setPosterIndex] = useState(0);
    const hasPosters = posters && posters.length > 0;
    const currentPoster = hasPosters ? posters[posterIndex] : posterPath;

    const handlePosterDoubleClick = () => {
        if (posters && posters.length > 1) {
            setPosterIndex((prev) => (prev + 1) % posters.length);
        }
    };

    // User Rating State & Integration
    const { getUserRating, setUserRating, removeUserRating } = useUserLists();
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const userRating = getUserRating(id);
    const userRatingTier = userRating !== undefined ? getRatingTier(userRating) : null;

    // Trailer Modal State
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const hasTrailers = trailers && trailers.length > 0;

    // Embla Carousel
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    // Gallery State & Browser History Management
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    const openGallery = useCallback(() => {
        setIsGalleryOpen(true);
        window.history.pushState({ galleryOpen: true }, '', '#gallery');
    }, []);

    const closeGallery = useCallback(() => {
        // If the hash is #gallery, hit back to remove it and trigger popstate
        if (window.location.hash === '#gallery') {
            window.history.back();
        } else {
            setIsGalleryOpen(false);
        }
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            // When URL changes (e.g., user hits back), if no #gallery hash, close gallery
            if (window.location.hash !== '#gallery') {
                setIsGalleryOpen(false);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Keyboard navigation for backdrops (Left/Right Arrow keys)
    useEffect(() => {
        if (!emblaApi || !backdropImages || backdropImages.length <= 1) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if modifier keys are pressed (e.g. Alt+Left for browser navigation)
            if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

            // Don't intercept when modal or full gallery is open
            if (isGalleryOpen || isRatingModalOpen) return;

            // Don't intercept if an interactive modal/dialog is present
            if (document.querySelector('[role="dialog"]')) return;

            // Ignore when typing in input/textarea/select/editable elements
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable ||
                    target.closest('input, textarea, select, [contenteditable="true"]'))
            ) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                emblaApi.scrollPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                emblaApi.scrollNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [emblaApi, backdropImages, isGalleryOpen, isRatingModalOpen]);

    // Scroll Animations
    const { scrollY } = useScroll();

    // Smooth 250-350ms feel for collapse
    const headerOpacity = useTransform(scrollY, [0, 250], [0, 1]);
    const headerY = useTransform(scrollY, [0, 250], [-20, 0]);

    const bannerOpacity = useTransform(scrollY, [0, 350], [1, 0.3]);
    const bannerScale = useTransform(scrollY, [0, 350], [1, 1.05]);
    const bannerY = useTransform(scrollY, [0, 350], [0, 100]); // Parallax effect

    const posterScale = useTransform(scrollY, [0, 250], [1, 0.6]);
    const posterY = useTransform(scrollY, [0, 250], [0, -80]);
    const posterOpacity = useTransform(scrollY, [200, 300], [1, 0]);

    const contentOpacity = useTransform(scrollY, [0, 150], [1, 0]);
    const contentY = useTransform(scrollY, [0, 150], [0, -20]);

    return (
        <div className="relative w-full h-[100svh] md:h-[100dvh] overflow-hidden bg-black">
            {/* Context Menu / 3-Dots */}
            <motion.div
                className="absolute top-4 right-4 md:top-6 md:right-6 z-40"
                style={{ opacity: contentOpacity, y: contentY }}
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
                className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-center pointer-events-none"
            >
                <div className="container mx-auto flex items-center justify-center gap-4">
                    {currentLogo ? (
                        <div
                            className="relative h-8 w-32 select-none cursor-pointer pointer-events-auto"
                            onDoubleClick={handleLogoDoubleClick}
                        >
                            <img
                                src={getResizedImage(currentLogo, "logo")}
                                alt={title}
                                className="w-full h-full object-contain object-center"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    ) : (
                        <h2 className="text-lg font-bold text-white truncate">{title}</h2>
                    )}
                </div>
            </motion.div>


            {/* Backdrop Carousel */}
            <motion.div
                className="absolute inset-x-0 top-0 h-[80%] md:h-[90%] z-0 select-none cursor-pointer pointer-events-auto"
                style={{ opacity: bannerOpacity, y: bannerY }}
                onDoubleClick={openGallery}
            >
                <div className="overflow-hidden h-full w-full" ref={emblaRef}>
                    <div className="flex h-full w-full touch-pan-y">
                        {backdropImages.map((src, index) => (
                            <div key={index} className="relative flex-[0_0_100%] h-full w-full min-w-0 bg-black overflow-hidden mr-4">
                                <motion.div
                                    className="absolute inset-0 origin-center"
                                    style={{ scale: bannerScale }}
                                >
                                    <img
                                        src={getResizedImage(src, "fullscreen")}
                                        alt={`Backdrop ${index + 1}`}
                                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                                        loading={index === 0 ? "eager" : "lazy"}
                                        decoding={index === 0 ? "auto" : "async"}
                                        fetchPriority={index === 0 ? "high" : "auto"}
                                    />

                                    {/* Feathered bottom edge to seamlessly blend into the black background */}
                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Carousel Dots */}
            {backdropImages.length > 1 && (
                <div className="absolute bottom-2 md:bottom-4 left-0 right-0 md:left-auto flex justify-center md:justify-end md:right-4 px-4 z-20 gap-1.5 md:gap-2">
                    {backdropImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => emblaApi && emblaApi.scrollTo(index)}
                            className={cn(
                                "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300",
                                index === selectedIndex ? "bg-white w-4 md:w-6" : "bg-neutral-500 hover:bg-neutral-400"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Content Container */}
            <div className="absolute inset-0 z-10 container mx-auto px-4 flex flex-col justify-end pb-6 md:pb-8 pointer-events-none">
                <div className="flex flex-row items-end gap-4 sm:gap-6 md:gap-12">

                    {/* Floating Poster */}
                    <motion.div
                        className="w-32 sm:w-40 md:w-64 aspect-[2/3] relative rounded-lg shadow-2xl shadow-black/50 overflow-hidden border border-neutral-700/50 flex-shrink-0 select-none cursor-pointer pointer-events-auto md:-mb-12"
                        style={{ scale: posterScale, y: posterY, opacity: posterOpacity }}
                        onDoubleClick={handlePosterDoubleClick}
                    >
                        <img
                            src={getResizedImage(currentPoster, "poster")}
                            alt={`${title} Poster`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </motion.div>

                    {/* Metadata & Actions */}
                    <motion.div
                        className="flex-1 min-w-0 space-y-2 md:space-y-6 w-full"
                        style={{ opacity: contentOpacity, y: contentY }}
                    >
                        {/* Title / Logo & Tagline Lockup */}
                        <div className="mb-3 md:mb-4 relative -top-3 md:top-0 w-fit max-w-full flex flex-col items-center">
                            {currentLogo ? (
                                <div
                                    className="relative h-14 sm:h-20 md:h-32 select-none cursor-pointer pointer-events-auto"
                                    onDoubleClick={handleLogoDoubleClick}
                                >
                                    <img
                                        src={getResizedImage(currentLogo, "logo")}
                                        alt={title}
                                        className="h-full w-auto max-w-[190px] sm:max-w-[260px] md:max-w-[440px] object-contain object-center pointer-events-none"
                                        loading="eager"
                                        fetchPriority="high"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-2xl sm:text-3xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl mb-1 text-center">
                                    {title}
                                </h1>
                            )}

                            {/* Tagline */}
                            {tagline && (
                                <p className="font-serif italic text-sm sm:text-base md:text-lg text-neutral-300/90 tracking-wide drop-shadow-md mt-1.5 md:mt-2 text-center max-w-[190px] sm:max-w-[260px] md:max-w-full leading-snug">
                                    &ldquo;{tagline}&rdquo;
                                </p>
                            )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm md:text-base font-medium text-neutral-300">
                            {/* Certification Badge */}
                            {certification && (
                                <>
                                    <span className="bg-neutral-800/80 backdrop-blur-sm px-2 py-0.5 md:py-1 rounded text-neutral-200 border border-neutral-500/60 font-semibold text-[10px] sm:text-xs md:text-sm tracking-wide">
                                        {certification}
                                    </span>
                                    <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                                </>
                            )}
                            <span className="bg-neutral-800/80 backdrop-blur-sm px-2 py-1 rounded text-white border border-neutral-700">
                                {releaseYear}
                            </span>
                            <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                            <span>{runtime}</span>
                            <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                            <div className="flex gap-2">
                                {genres.slice(0, 3).map((g) => (
                                    <span key={g} className="text-neutral-200">{g}</span>
                                ))}
                            </div>
                            {/* Watch Trailer Button */}
                            {hasTrailers && (
                                <>
                                    <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                                    <button
                                        onClick={() => setIsTrailerOpen(true)}
                                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1 md:py-1.5 rounded-full text-white text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer group/trailer pointer-events-auto border border-white/10 hover:border-white/20"
                                        title="Watch Trailer"
                                    >
                                        <Play size={12} className="md:w-[14px] md:h-[14px] fill-current group-hover/trailer:scale-110 transition-transform" />
                                        <span>Trailer</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Ratings - Own row on mobile, aligned with metadata on desktop */}
                <motion.div
                    className="mt-3 md:mt-2 md:ml-[calc(theme(width.64)+theme(gap.12))]"
                    style={{ opacity: contentOpacity, y: contentY }}
                >
                    <div className="flex items-center gap-3 md:gap-4 bg-neutral-900/60 backdrop-blur-md border border-neutral-700/50 rounded-full px-3 md:px-4 py-1.5 md:py-2 w-fit mx-auto md:mx-0 pointer-events-auto">
                        {/* IMDb */}
                        {omdbRatings?.imdb && (
                            <a
                                href={imdbId ? `https://www.imdb.com/title/${imdbId}/` : undefined}
                                target="_blank" rel="noopener noreferrer"
                                className={cn("flex items-center gap-1 md:gap-2", imdbId && "hover:opacity-80 transition-opacity cursor-pointer")}
                                title="View on IMDb"
                            >
                                <IMDbIcon className="w-7 h-3.5 md:w-10 md:h-5" />
                                <span className="text-white font-semibold text-xs md:text-base">
                                    {omdbRatings.imdb}
                                </span>
                            </a>
                        )}

                        {/* Metacritic */}
                        {omdbRatings?.metacritic && (
                            <a
                                href={`https://www.metacritic.com/search/${encodeURIComponent(title)}/`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                                title="Search on Metacritic"
                            >
                                <MetacriticIcon className="w-4 h-4 md:w-6 md:h-6" />
                                <span className="text-white font-semibold text-xs md:text-base">
                                    {omdbRatings.metacritic}
                                </span>
                            </a>
                        )}

                        {/* IGDB (games only) */}
                        {mediaType === 'game' && (
                            <a
                                href={`https://www.igdb.com/games/${encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                                title="View on IGDB"
                            >
                                <IGDBIcon className="w-10 h-4 md:w-14 md:h-5" />
                                <span className="text-white font-semibold text-xs md:text-base">
                                    {rating.toFixed(1)}
                                </span>
                            </a>
                        )}

                        {/* TMDB (always shown) */}
                        <a
                            href={`https://www.themoviedb.org/${mediaType === 'game' ? 'movie' : (mediaType || 'movie')}/${id}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                            title="View on TMDB"
                        >
                            <TMDBLogo className="w-4 h-4 md:w-6 md:h-6" />
                            <span className="text-white font-semibold text-xs md:text-base">
                                {rating.toFixed(1)}
                            </span>
                        </a>

                        {/* Rotten Tomatoes */}
                        {omdbRatings?.rottenTomatoes && (
                            <a
                                href={omdbRatings.rottenTomatoesUrl || getRottenTomatoesUrl(title, mediaType)}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                                title="View on Rotten Tomatoes"
                            >
                                <RottenTomatoesIcon
                                    className="w-4 h-4 md:w-6 md:h-6"
                                    fresh={parseInt(omdbRatings.rottenTomatoes) >= 60}
                                />
                                <span className="text-white font-semibold text-xs md:text-base">
                                    {omdbRatings.rottenTomatoes}
                                </span>
                            </a>
                        )}

                        {/* Divider */}
                        <div className="w-px h-4 md:h-5 bg-neutral-600" />

                        {/* Rate Button */}
                        {userRating !== undefined ? (
                            <button
                                className="flex items-center gap-1 md:gap-1.5 px-2.5 py-0.5 md:py-1 rounded-full border transition-all cursor-pointer group/rate hover:scale-105 active:scale-95"
                                style={{
                                    borderColor: userRatingTier?.color || '#f59e0b',
                                    backgroundColor: `${userRatingTier?.color}20`,
                                    boxShadow: `0 0 12px ${userRatingTier?.glowColor}`
                                }}
                                title={`Your rating: ${userRating.toFixed(1)}/10. Click to change`}
                                onClick={() => setIsRatingModalOpen(true)}
                            >
                                <Star
                                    size={14}
                                    className="md:w-4 md:h-4 fill-current transition-transform group-hover/rate:scale-110"
                                    style={{ color: userRatingTier?.color || '#f59e0b' }}
                                />
                                <span
                                    className="font-extrabold text-xs md:text-sm font-mono tracking-tight"
                                    style={{ color: userRatingTier?.color || '#f59e0b' }}
                                >
                                    {userRating.toFixed(1)}
                                </span>
                                <span className="text-[10px] md:text-xs text-neutral-400 font-medium">
                                    You
                                </span>
                            </button>
                        ) : (
                            <button
                                className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity cursor-pointer group/rate"
                                title="Rate this title"
                                onClick={() => setIsRatingModalOpen(true)}
                            >
                                <Star size={14} className="text-amber-400 md:w-[18px] md:h-[18px] transition-transform group-hover/rate:scale-110" />
                                <span className="text-white group-hover/rate:text-amber-400 font-semibold text-xs md:text-base">Rate</span>
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Rating Modal (Precision Radial Dial) */}
            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                title={title}
                mediaType={mediaType}
                posterPath={currentPoster || posterPath}
                releaseYear={releaseYear}
                currentRating={userRating}
                imdbRating={omdbRatings?.imdb}
                tmdbRating={rating ? rating.toFixed(1) : undefined}
                onSaveRating={(newRating) => {
                    setUserRating({
                        id,
                        title,
                        poster_path: posterPath,
                        backdrop_path: backdropImages?.[0],
                        media_type: mediaType === 'game' ? 'game' : (mediaType || 'movie'),
                        release_year: releaseYear,
                        runtime_or_episodes: runtime,
                        rating_imdb: omdbRatings?.imdb ? parseFloat(omdbRatings.imdb) : undefined,
                        rating_tmdb: rating,
                        genres
                    }, newRating);
                }}
                onRemoveRating={() => {
                    removeUserRating(id);
                }}
            />

            {/* Fullscreen Gallery Form */}
            {isGalleryOpen && backdropImages.length > 0 && (
                <BackdropGallery
                    images={backdropImages}
                    initialIndex={selectedIndex}
                    onIndexChange={(idx) => {
                        if (emblaApi) emblaApi.scrollTo(idx, true);
                    }}
                    onClose={closeGallery}
                />
            )}

            {/* Trailer Modal */}
            {hasTrailers && (
                <TrailerModal
                    isOpen={isTrailerOpen}
                    onClose={() => setIsTrailerOpen(false)}
                    trailers={trailers}
                    title={title}
                />
            )}
        </div>
    );
}
