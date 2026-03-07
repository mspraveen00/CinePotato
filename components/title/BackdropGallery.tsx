'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getResizedImage } from '@/lib/image-utils';

interface BackdropGalleryProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

export default function BackdropGallery({ images, initialIndex, onClose }: BackdropGalleryProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Auto-scroll to center active thumbnail
    useEffect(() => {
        if (!scrollContainerRef.current || !thumbnailRefs.current[currentIndex]) return;

        const container = scrollContainerRef.current;
        const thumbnail = thumbnailRefs.current[currentIndex];

        if (!thumbnail) return;

        const containerCenter = container.clientWidth / 2;
        const thumbnailCenter = thumbnail.offsetLeft + thumbnail.clientWidth / 2;
        const targetScroll = thumbnailCenter - containerCenter;

        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }, [currentIndex]);

    const handlePrevious = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        // Prevent body scroll when gallery is open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleNext, handlePrevious, onClose]);

    // Swipe logic for mobile
    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    if (!images || images.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[100] bg-black flex flex-col touch-none"
                onClick={onClose}
            >
                {/* Main Image Area with Swipe */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.img
                            key={currentIndex}
                            src={getResizedImage(images[currentIndex], "fullscreen")}
                            alt={`Gallery image ${currentIndex + 1}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="w-full h-full object-contain shadow-2xl cursor-grab active:cursor-grabbing"
                            loading="eager"
                            decoding="async"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);
                                if (swipe < -swipeConfidenceThreshold) {
                                    handleNext();
                                } else if (swipe > swipeConfidenceThreshold) {
                                    handlePrevious();
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </AnimatePresence>
                </div>

                {/* Left Hover Zone (Desktop) */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-32 z-10 hidden md:flex items-center justify-start pl-8 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-black/60 to-transparent cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handlePrevious(e); }}
                >
                    <button className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-neutral-700/50 text-white hover:bg-neutral-800 hover:text-primary transition-all shadow-xl">
                        <ChevronLeft size={32} />
                    </button>
                </div>

                {/* Right Hover Zone (Desktop) */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-32 z-10 hidden md:flex items-center justify-end pr-8 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-l from-black/60 to-transparent cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleNext(e); }}
                >
                    <button className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-neutral-700/50 text-white hover:bg-neutral-800 hover:text-primary transition-all shadow-xl">
                        <ChevronRight size={32} />
                    </button>
                </div>

                {/* Top Hover Zone (Always visible mobile, hover desktop) */}
                <div
                    className="absolute top-0 left-0 right-0 h-32 flex justify-between items-start pt-4 px-4 md:pt-6 md:px-6 z-20 
                    opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-neutral-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-700/50 text-white font-medium text-sm tracking-wide shadow-xl">
                        {currentIndex + 1} / {images.length}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 md:p-3 rounded-full bg-neutral-900/60 backdrop-blur-md border border-neutral-700/50 text-white hover:bg-neutral-800 transition-colors hover:text-red-400 shadow-xl"
                        title="Close Gallery (Esc)"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Bottom Hover Zone (Always visible mobile, hover desktop) */}
                {images.length > 1 && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-40 flex items-end pb-4 z-20 
                        opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* We add px-[50vw] so the first/last items can scroll to center */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 overflow-x-auto w-full scrollbar-hide snap-x pointer-events-auto px-[50vw] py-4 items-center"
                        >
                            {images.map((src, idx) => (
                                <button
                                    key={idx}
                                    ref={(el) => { thumbnailRefs.current[idx] = el; }}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`relative flex-shrink-0 h-16 md:h-20 aspect-video rounded-md transition-all snap-center ${idx === currentIndex
                                        ? 'ring-2 ring-white scale-110 shadow-lg shadow-white/20 z-10'
                                        : 'hover:scale-105'
                                        }`}
                                    style={idx === 0 ? { marginLeft: '-50%' } : idx === images.length - 1 ? { marginRight: '-50%' } : {}}
                                >
                                    <img
                                        src={getResizedImage(src, "thumbnail")}
                                        className="w-full h-full object-cover rounded-md"
                                        alt={`Thumbnail ${idx + 1}`}
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
