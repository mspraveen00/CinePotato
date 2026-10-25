'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Play } from 'lucide-react';
import { TrailerVideo } from '@/types/title';

interface TrailerModalProps {
    isOpen: boolean;
    onClose: () => void;
    trailers: TrailerVideo[];
    title: string;
}

export default function TrailerModal({ isOpen, onClose, trailers, title }: TrailerModalProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const activeTrailer = trailers[activeIndex];

    // Reset to first trailer when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveIndex(0);
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!activeTrailer) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Trailer: ${activeTrailer.name}`}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />

                    {/* Content */}
                    <motion.div
                        className="relative z-10 w-full max-w-5xl mx-4 md:mx-8"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 md:-top-14 md:-right-2 flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800/80 border border-neutral-600/50 text-white hover:bg-neutral-700 hover:border-neutral-500 transition-all cursor-pointer z-20"
                            title="Close"
                        >
                            <X size={20} />
                        </button>

                        {/* Video Player Container */}
                        <div className="relative w-full aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700/50 shadow-2xl shadow-black/60">
                            <iframe
                                key={activeTrailer.key}
                                src={`https://www.youtube.com/embed/${activeTrailer.key}?autoplay=1&rel=0&modestbranding=1`}
                                title={activeTrailer.name}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>

                        {/* Video Info Bar */}
                        <div className="mt-4 flex items-center justify-between gap-4">
                            {/* Title & Selector */}
                            <div className="relative flex-1 min-w-0">
                                {trailers.length > 1 ? (
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 text-left max-w-full group cursor-pointer"
                                    >
                                        <span className="text-white font-semibold text-sm md:text-base truncate">
                                            {activeTrailer.name}
                                        </span>
                                        <span className="text-neutral-500 text-xs md:text-sm flex-shrink-0">
                                            {activeTrailer.type}
                                        </span>
                                        <ChevronDown
                                            size={16}
                                            className={`text-neutral-400 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-semibold text-sm md:text-base truncate">
                                            {activeTrailer.name}
                                        </span>
                                        <span className="text-neutral-500 text-xs md:text-sm">
                                            {activeTrailer.type}
                                        </span>
                                    </div>
                                )}

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full left-0 mt-2 w-full max-w-md bg-neutral-900 border border-neutral-700/50 rounded-lg shadow-xl overflow-hidden z-30"
                                        >
                                            {trailers.map((trailer, index) => (
                                                <button
                                                    key={trailer.id}
                                                    onClick={() => {
                                                        setActiveIndex(index);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800 transition-colors cursor-pointer ${
                                                        index === activeIndex ? 'bg-neutral-800/80' : ''
                                                    }`}
                                                >
                                                    <Play
                                                        size={14}
                                                        className={`flex-shrink-0 ${
                                                            index === activeIndex ? 'text-white' : 'text-neutral-500'
                                                        }`}
                                                    />
                                                    <span className={`text-sm truncate ${
                                                        index === activeIndex ? 'text-white font-medium' : 'text-neutral-300'
                                                    }`}>
                                                        {trailer.name}
                                                    </span>
                                                    <span className="text-neutral-500 text-xs flex-shrink-0 ml-auto">
                                                        {trailer.type}
                                                    </span>
                                                    {trailer.official && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/50 text-emerald-400 rounded-full flex-shrink-0">
                                                            Official
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Title label */}
                            <span className="hidden md:block text-neutral-500 text-sm flex-shrink-0">
                                {title}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
