'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, Share2, Plus, Play } from 'lucide-react';
import { HeroBannerProps } from '@/types/title';
import { cn } from '@/lib/utils';

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
        logoPath,
    } = titleDetail;

    // Embla Carousel
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
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
        <div className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden bg-neutral-900">
            {/* Sticky Header (Hidden initially) */}
            <motion.div
                style={{ opacity: headerOpacity, y: headerY }}
                className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-center"
            >
                <div className="container mx-auto flex items-center justify-center gap-4">
                    {logoPath ? (
                        <div className="relative h-8 w-32">
                            <Image src={logoPath} alt={title} fill className="object-contain object-center" />
                        </div>
                    ) : (
                        <h2 className="text-lg font-bold text-white truncate">{title}</h2>
                    )}
                </div>
            </motion.div>


            {/* Backdrop Carousel */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ opacity: bannerOpacity, scale: bannerScale, y: bannerY }}
            >
                <div className="overflow-hidden h-full w-full" ref={emblaRef}>
                    <div className="flex h-full w-full touch-pan-y">
                        {backdropImages.slice(0, 3).map((src, index) => (
                            <div key={index} className="relative flex-[0_0_100%] h-full w-full min-w-0">
                                <Image
                                    src={src}
                                    alt={`Backdrop ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    quality={90}
                                />
                                {/* Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 via-transparent to-transparent" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Carousel Dots */}
                {backdropImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                        {backdropImages.slice(0, 3).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => emblaApi && emblaApi.scrollTo(index)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    index === selectedIndex ? "bg-white w-6" : "bg-neutral-500 hover:bg-neutral-400"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Content Container */}
            <div className="absolute inset-0 z-10 container mx-auto px-4 flex flex-col justify-end pb-12 md:pb-24">
                <div className="flex flex-col md:flex-row items-end gap-8 md:gap-12">

                    {/* Floating Poster */}
                    <motion.div
                        className="hidden md:block w-64 aspect-[2/3] relative rounded-lg shadow-2xl shadow-black/50 overflow-hidden border border-neutral-700/50 flex-shrink-0"
                        style={{ scale: posterScale, y: posterY, opacity: posterOpacity }}
                    >
                        <Image
                            src={posterPath}
                            alt={`${title} Poster`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </motion.div>

                    {/* Metadata & Actions */}
                    <motion.div
                        className="flex-1 space-y-6 w-full"
                        style={{ opacity: contentOpacity, y: contentY }}
                    >
                        {/* Title / Logo */}
                        <div className="mb-4">
                            {logoPath ? (
                                <div className="relative h-24 md:h-32 w-64 md:w-96 mb-4 origin-left">
                                    <Image
                                        src={logoPath}
                                        alt={title}
                                        fill
                                        className="object-contain object-left"
                                        priority
                                    />
                                </div>
                            ) : (
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl mb-2">
                                    {title}
                                </h1>
                            )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-neutral-300">
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
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        className={cn(
                                            "fill-current",
                                            i < Math.round(rating / 2) ? "text-yellow-500" : "text-neutral-600"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-neutral-400 text-sm">({rating.toFixed(1)}) / 10</span>
                        </div>

                        {/* Overview (Mobile Only - simplified) */}
                        <p className="md:hidden text-neutral-300 line-clamp-3 text-sm leading-relaxed max-w-xl">
                            {overview}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 pt-4">
                            <button className="flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-neutral-200 transition-colors text-lg shadow-lg shadow-white/10">
                                <Play size={20} className="fill-current" />
                                <span>Play</span>
                            </button>

                            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800/80 backdrop-blur-md border border-neutral-600 text-white hover:bg-neutral-700/80 hover:border-neutral-500 transition-all group">
                                <Plus size={24} className="group-hover:text-primary transition-colors" />
                            </button>

                            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800/80 backdrop-blur-md border border-neutral-600 text-white hover:bg-neutral-700/80 hover:border-neutral-500 transition-all group">
                                <Share2 size={20} className="group-hover:text-blue-400 transition-colors" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
