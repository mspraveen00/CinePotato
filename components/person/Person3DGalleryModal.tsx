'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { getResizedImage } from '@/lib/image-utils';

interface Person3DGalleryModalProps {
    images: string[];
    name: string;
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function Person3DGalleryModal({
    images,
    name,
    initialIndex = 0,
    isOpen,
    onClose,
}: Person3DGalleryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync initialIndex when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleNext, handlePrevious, onClose]);

    if (!isOpen || !images || images.length === 0) return null;

    const total = images.length;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none"
                onClick={onClose}
            >
                {/* Background Ambient Glow matching active photo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <img
                        key={currentIndex}
                        src={getResizedImage(images[currentIndex], "fullscreen")}
                        alt=""
                        className="w-full h-full object-cover blur-3xl scale-125 transition-all duration-700"
                    />
                </div>

                {/* Top Header Bar */}
                <div
                    className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-neutral-800/60 bg-gradient-to-b from-black/80 to-transparent"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-700/60 text-primary">
                            <Images size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base sm:text-lg">{name}</h3>
                            <p className="text-xs text-neutral-400">
                                Photo {currentIndex + 1} of {total}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white transition-all shadow-lg cursor-pointer"
                        title="Close Gallery (Esc)"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main 3D Stage Area */}
                <div
                    ref={containerRef}
                    className="relative flex-1 flex items-center justify-center overflow-hidden [perspective:1400px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Navigation Arrow - Left */}
                    {total > 1 && (
                        <button
                            onClick={handlePrevious}
                            className="absolute left-4 sm:left-8 z-40 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 border border-neutral-700/60 text-white hover:text-primary transition-all shadow-2xl backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95"
                            title="Previous Photo (Left Arrow)"
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    {/* Navigation Arrow - Right */}
                    {total > 1 && (
                        <button
                            onClick={handleNext}
                            className="absolute right-4 sm:right-8 z-40 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 border border-neutral-700/60 text-white hover:text-primary transition-all shadow-2xl backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95"
                            title="Next Photo (Right Arrow)"
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}

                    {/* 3D Carousel Cards */}
                    <div className="relative w-full h-[65vh] sm:h-[70vh] flex items-center justify-center [transform-style:preserve-3d]">
                        {images.map((src, index) => {
                            // Calculate relative offset from currentIndex
                            let offset = index - currentIndex;

                            // Handle wrap-around for smooth looping if many images
                            if (total > 3) {
                                if (offset > total / 2) offset -= total;
                                if (offset < -total / 2) offset += total;
                            }

                            const isActive = offset === 0;
                            const isVisible = Math.abs(offset) <= 3;

                            if (!isVisible) return null;

                            // Responsive sizing & positioning parameters
                            const xOffset = offset * 180; // horizontal spacing in 3D
                            const zOffset = -Math.abs(offset) * 150; // depth receding
                            const rotationY = offset > 0 ? -38 : offset < 0 ? 38 : 0; // 3D angle
                            const scale = isActive ? 1 : Math.max(0.68, 1 - Math.abs(offset) * 0.12);
                            const opacity = isActive ? 1 : Math.max(0.25, 0.9 - Math.abs(offset) * 0.25);
                            const zIndex = 30 - Math.abs(offset);

                            return (
                                <motion.div
                                    key={src}
                                    className="absolute cursor-pointer will-change-transform"
                                    onClick={() => setCurrentIndex(index)}
                                    animate={{
                                        x: xOffset,
                                        z: zOffset,
                                        rotateY: rotationY,
                                        scale: scale,
                                        opacity: opacity,
                                    }}
                                    transition={{
                                        duration: 0.45,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    style={{
                                        zIndex: zIndex,
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <div
                                        className={`relative w-[240px] sm:w-[320px] md:w-[380px] aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-300 ${
                                            isActive
                                                ? 'ring-2 ring-white/90 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
                                                : 'ring-1 ring-white/20 shadow-2xl hover:ring-white/50'
                                        }`}
                                    >
                                        <img
                                            src={getResizedImage(src, 'fullscreen')}
                                            alt={`${name} photo ${index + 1}`}
                                            className="w-full h-full object-cover select-none"
                                            loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                                            decoding="async"
                                        />

                                        {/* Subtle gradient vignette to blend card edges */}
                                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Thumbnail Strip / Dots */}
                <div
                    className="relative z-20 px-6 py-4 flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide bg-gradient-to-t from-black/90 to-transparent"
                    onClick={(e) => e.stopPropagation()}
                >
                    {total <= 12 ? (
                        <div className="flex items-center gap-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                        index === currentIndex
                                            ? 'w-8 bg-white'
                                            : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                                    }`}
                                    aria-label={`Go to photo ${index + 1}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {images.map((src, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`relative flex-shrink-0 w-10 h-14 rounded-md overflow-hidden transition-all cursor-pointer ${
                                        index === currentIndex
                                            ? 'ring-2 ring-white scale-110'
                                            : 'opacity-50 hover:opacity-100'
                                    }`}
                                >
                                    <img
                                        src={getResizedImage(src, 'thumbnail')}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
