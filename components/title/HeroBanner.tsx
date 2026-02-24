'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, MoreVertical } from 'lucide-react';
import { HeroBannerProps } from '@/types/title';
import { cn } from '@/lib/utils';
import { getResizedImage, generateSrcSet } from '@/lib/image-utils';

export default function HeroBanner({ titleDetail }: HeroBannerProps) {
    const {
        title,
        overview,
        backdropImages,
        posterPath,
        releaseYear,
        runtime,
        genres,
        rating,
        logos,
    } = titleDetail;

    const [logoIndex, setLogoIndex] = useState(0);
    const hasLogos = logos && logos.length > 0;
    const currentLogo = hasLogos ? logos[logoIndex] : undefined;

    const handleLogoDoubleClick = () => {
        if (logos && logos.length > 1) {
            setLogoIndex((prev) => (prev + 1) % logos.length);
        }
    };

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
        <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
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
                            title={logos && logos.length > 1 ? "Double click to change logo" : undefined}
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
                className="absolute inset-x-0 top-0 h-[80vh] md:h-[90vh] z-0"
                style={{ opacity: bannerOpacity, scale: bannerScale, y: bannerY }}
            >
                <div className="overflow-hidden h-full w-full" ref={emblaRef}>
                    <div className="flex h-full w-full touch-pan-y">
                        {backdropImages.map((src, index) => (
                            <div key={index} className="relative flex-[0_0_100%] h-full w-full min-w-0 mr-[1px]">
                                <img
                                    src={getResizedImage(src, "hero")}
                                    srcSet={generateSrcSet(src, [
                                        { preset: "hero_mobile", width: 780 },
                                        { preset: "hero", width: 1280 },
                                        { preset: "fullscreen", width: 1920 }
                                    ])}
                                    sizes="(max-width: 768px) 100vw, 100vw"
                                    alt={`Backdrop ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    loading={index === 0 ? "eager" : "lazy"}
                                    decoding={index === 0 ? "auto" : "async"}
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                />
                                {/* Feathered bottom edge to seamlessly blend into the black background */}
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
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
                        className="w-32 sm:w-40 md:w-64 aspect-[2/3] relative rounded-lg shadow-2xl shadow-black/50 overflow-hidden border border-neutral-700/50 flex-shrink-0"
                        style={{ scale: posterScale, y: posterY, opacity: posterOpacity }}
                    >
                        <img
                            src={getResizedImage(posterPath, "poster")}
                            alt={`${title} Poster`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </motion.div>

                    {/* Metadata & Actions */}
                    <motion.div
                        className="flex-1 space-y-2 md:space-y-6 w-full"
                        style={{ opacity: contentOpacity, y: contentY }}
                    >
                        {/* Title / Logo */}
                        <div className="mb-2 md:mb-4 relative -top-3 md:top-0">
                            {currentLogo ? (
                                <div
                                    className="relative h-20 sm:h-24 md:h-32 w-48 sm:w-64 md:w-96 mb-2 md:mb-4 origin-left select-none cursor-pointer pointer-events-auto"
                                    onDoubleClick={handleLogoDoubleClick}
                                    title={logos && logos.length > 1 ? "Double click to change logo" : undefined}
                                >
                                    <img
                                        src={getResizedImage(currentLogo, "logo")}
                                        alt={title}
                                        className="absolute inset-0 w-full h-full object-contain object-left pointer-events-none"
                                        loading="eager"
                                        fetchPriority="high"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-2xl sm:text-3xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl mb-2">
                                    {title}
                                </h1>
                            )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm md:text-base font-medium text-neutral-300">
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
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 md:gap-2 mt-1 md:mt-0">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-3.5 h-3.5 md:w-[18px] md:h-[18px] fill-current",
                                            i < Math.round(rating / 2) ? "text-yellow-500" : "text-neutral-600"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-neutral-400 text-xs md:text-sm">({rating.toFixed(1)}) / 10</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
