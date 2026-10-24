'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getResizedImage } from '@/lib/image-utils';

export interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    mediaType?: 'movie' | 'tv' | 'game' | 'episode' | 'person';
    posterPath?: string;
    releaseYear?: number;
    currentRating?: number; // 0.0 to 10.0 or undefined
    imdbRating?: number | string;
    tmdbRating?: number | string;
    onSaveRating: (rating: number) => void;
    onRemoveRating?: () => void;
}

export function getRatingTier(score: number) {
    if (score >= 9.5) {
        return {
            label: 'Masterpiece',
            tag: '👑 Masterpiece',
            color: '#ec4899', // Hyper Pink/Violet
            glowColor: 'rgba(236, 72, 153, 0.45)',
            badgeBg: 'bg-pink-500/15 text-pink-300 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]',
            strokeColor: '#f43f5e',
            gradientId: 'grad-masterpiece',
            gradientStops: [
                { offset: '0%', color: '#ec4899' },
                { offset: '50%', color: '#8b5cf6' },
                { offset: '100%', color: '#38bdf8' }
            ],
            btnGradient: 'from-pink-500 via-purple-500 to-indigo-500'
        };
    }
    if (score >= 8.5) {
        return {
            label: 'Exceptional',
            tag: '⚡ Exceptional',
            color: '#06b6d4', // Cyan
            glowColor: 'rgba(6, 182, 212, 0.45)',
            badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
            strokeColor: '#06b6d4',
            gradientId: 'grad-exceptional',
            gradientStops: [
                { offset: '0%', color: '#06b6d4' },
                { offset: '100%', color: '#10b981' }
            ],
            btnGradient: 'from-cyan-500 to-emerald-500'
        };
    }
    if (score >= 7.0) {
        return {
            label: 'Great',
            tag: '✨ Great',
            color: '#10b981', // Emerald
            glowColor: 'rgba(16, 185, 129, 0.4)',
            badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
            strokeColor: '#10b981',
            gradientId: 'grad-great',
            gradientStops: [
                { offset: '0%', color: '#34d399' },
                { offset: '100%', color: '#a3e635' }
            ],
            btnGradient: 'from-emerald-500 to-lime-500'
        };
    }
    if (score >= 5.5) {
        return {
            label: 'Decent',
            tag: '👌 Decent',
            color: '#f59e0b', // Amber
            glowColor: 'rgba(245, 158, 11, 0.4)',
            badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
            strokeColor: '#f59e0b',
            gradientId: 'grad-decent',
            gradientStops: [
                { offset: '0%', color: '#fbbf24' },
                { offset: '100%', color: '#f97316' }
            ],
            btnGradient: 'from-amber-500 to-orange-500'
        };
    }
    if (score >= 4.0) {
        return {
            label: 'Mediocre',
            tag: '😐 Mediocre',
            color: '#f97316', // Orange
            glowColor: 'rgba(249, 115, 22, 0.35)',
            badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.25)]',
            strokeColor: '#f97316',
            gradientId: 'grad-mediocre',
            gradientStops: [
                { offset: '0%', color: '#fb923c' },
                { offset: '100%', color: '#ef4444' }
            ],
            btnGradient: 'from-orange-500 to-red-500'
        };
    }
    if (score > 0) {
        return {
            label: 'Poor',
            tag: '👎 Poor',
            color: '#ef4444', // Red
            glowColor: 'rgba(239, 68, 68, 0.4)',
            badgeBg: 'bg-red-500/15 text-red-300 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
            strokeColor: '#ef4444',
            gradientId: 'grad-poor',
            gradientStops: [
                { offset: '0%', color: '#f87171' },
                { offset: '100%', color: '#dc2626' }
            ],
            btnGradient: 'from-rose-600 to-red-700'
        };
    }
    return {
        label: 'Zero',
        tag: '○ Zero',
        color: '#71717a', // Slate
        glowColor: 'rgba(113, 113, 122, 0.2)',
        badgeBg: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        strokeColor: '#52525b',
        gradientId: 'grad-zero',
        gradientStops: [
            { offset: '0%', color: '#71717a' },
            { offset: '100%', color: '#52525b' }
        ],
        btnGradient: 'from-zinc-700 to-neutral-800'
    };
}

// Convert polar angle (degrees) to Cartesian coordinates
function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians)
    };
}

// Create an SVG arc path description
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 1, end.x, end.y].join(' ');
}

export default function RatingModal({
    isOpen,
    onClose,
    title,
    mediaType,
    posterPath,
    releaseYear,
    currentRating,
    imdbRating,
    tmdbRating,
    onSaveRating,
    onRemoveRating
}: RatingModalProps) {
    // 1. Initial rating starts at 0.0 if not rated yet
    const [score, setScore] = useState<number>(currentRating !== undefined ? currentRating : 0.0);
    const [isDragging, setIsDragging] = useState(false);

    const svgRef = useRef<SVGSVGElement | null>(null);
    const dialContainerRef = useRef<HTMLDivElement | null>(null);

    // Sync when currentRating changes upon modal opening
    useEffect(() => {
        if (isOpen) {
            setScore(currentRating !== undefined ? currentRating : 0.0);
        }
    }, [isOpen, currentRating]);

    // Prevent background page from scrolling while modal is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // Keyboard support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                setScore(prev => Math.min(10.0, Math.round((prev + 0.1) * 10) / 10));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                setScore(prev => Math.max(0.0, Math.round((prev - 0.1) * 10) / 10));
            } else if (e.key === 'PageUp') {
                e.preventDefault();
                setScore(prev => Math.min(10.0, Math.round((prev + 1.0) * 10) / 10));
            } else if (e.key === 'PageDown') {
                e.preventDefault();
                setScore(prev => Math.max(0.0, Math.round((prev - 1.0) * 10) / 10));
            } else if (e.key === 'Home') {
                e.preventDefault();
                setScore(0.0);
            } else if (e.key === 'End') {
                e.preventDefault();
                setScore(10.0);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onSaveRating(score);
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, score, onSaveRating, onClose]);

    // Geometry constants with headroom so number 5 is completely visible
    const CX = 140;
    const CY = 146;
    const RADIUS = 92;
    const START_ANGLE = 135; // Bottom left (8 o'clock)
    const END_ANGLE = 405;   // Bottom right (4 o'clock)
    const TOTAL_SPAN = END_ANGLE - START_ANGLE; // 270 degrees

    // Exact arc length for stroke-dasharray (eliminates path distortion / dancing rainbow)
    const arcCircumference = 2 * Math.PI * RADIUS;
    const arcLength = (TOTAL_SPAN / 360) * arcCircumference;
    const strokeDashoffset = arcLength * (1 - score / 10.0);

    // Current pointer angle & knob position
    const currentAngle = START_ANGLE + (score / 10.0) * TOTAL_SPAN;
    const knobPos = polarToCartesian(CX, CY, RADIUS, currentAngle);
    const tier = getRatingTier(score);

    // Calculate score from pointer coordinates
    const updateScoreFromPointer = useCallback((clientX: number, clientY: number) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = 280 / rect.width;
        const scaleY = 270 / rect.height;
        const svgX = (clientX - rect.left) * scaleX;
        const svgY = (clientY - rect.top) * scaleY;

        const dx = svgX - CX;
        const dy = svgY - CY;

        let angleRad = Math.atan2(dy, dx);
        let deg = (angleRad * 180) / Math.PI;
        if (deg < 0) deg += 360;

        // Map to 135 -> 405 range
        if (deg < 90) {
            deg += 360;
        }

        // Deal with gap at bottom (between 45° and 135°)
        if (deg > 45 && deg < 135) {
            if (deg < 90) {
                deg = 405;
            } else {
                deg = 135;
            }
        }

        const clampedDeg = Math.max(START_ANGLE, Math.min(END_ANGLE, deg));
        const fraction = (clampedDeg - START_ANGLE) / TOTAL_SPAN;
        const newScore = Math.max(0.0, Math.min(10.0, Math.round(fraction * 100) / 10));

        setScore(newScore);
    }, [CX, CY, START_ANGLE, END_ANGLE, TOTAL_SPAN]);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateScoreFromPointer(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        updateScoreFromPointer(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        try {
            (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
        } catch {
            // Ignore capture release
        }
    };

    // 5. Native non-passive wheel listener:
    // Moving fingers UP on trackpad (deltaY > 0 in natural scrolling) INCREASES rating
    // Moving fingers DOWN on trackpad (deltaY < 0) DECREASES rating
    useEffect(() => {
        const el = dialContainerRef.current;
        if (!el || !isOpen) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const delta = e.deltaY > 0 ? 0.1 : -0.1;
            const step = e.shiftKey ? delta * 5 : delta;

            setScore(prev => {
                const next = Math.round((prev + step) * 10) / 10;
                return Math.max(0.0, Math.min(10.0, next));
            });
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => {
            el.removeEventListener('wheel', onWheel);
        };
    }, [isOpen]);

    // Generate ticks
    const tickMarks = [];
    const NUM_TICKS = 50; // Every 0.2
    for (let i = 0; i <= NUM_TICKS; i++) {
        const val = (i / NUM_TICKS) * 10;
        const isInteger = i % 5 === 0;
        const tickAngle = START_ANGLE + (i / NUM_TICKS) * TOTAL_SPAN;
        const isPassed = val <= score + 0.05;

        const rInner = isInteger ? 104 : 108;
        const rOuter = 116;

        const p1 = polarToCartesian(CX, CY, rInner, tickAngle);
        const p2 = polarToCartesian(CX, CY, rOuter, tickAngle);

        tickMarks.push({
            id: i,
            val,
            isInteger,
            isPassed,
            p1,
            p2
        });
    }

    // Static master arc path (never changes, preventing any trajectory distortion)
    const masterArcPath = describeArc(CX, CY, RADIUS, START_ANGLE, END_ANGLE);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            >
                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-[420px] rounded-3xl bg-neutral-950/95 border border-neutral-800/80 p-6 md:p-7 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden"
                >
                    {/* Ambient Glow matching score tier */}
                    <div
                        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors duration-500"
                        style={{ backgroundColor: tier.glowColor }}
                    />
                    <div
                        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors duration-500"
                        style={{ backgroundColor: tier.glowColor }}
                    />

                    {/* Header */}
                    <div className="relative flex items-center justify-between pb-4 border-b border-neutral-800/60 z-10">
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                            {posterPath ? (
                                <img
                                    src={getResizedImage(`https://image.tmdb.org/t/p/original${posterPath}`, 'poster')}
                                    alt={title}
                                    className="w-10 h-14 object-cover rounded-lg border border-neutral-700/60 shadow-md shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-14 bg-neutral-800 rounded-lg flex items-center justify-center text-[10px] text-neutral-500 shrink-0">
                                    No Img
                                </div>
                            )}
                            <div className="min-w-0">
                                <h3 className="text-white font-bold text-base md:text-lg leading-tight truncate">
                                    {title}
                                </h3>
                                <p className="text-neutral-400 text-xs mt-0.5 flex items-center gap-2">
                                    <span>{releaseYear || 'Title'}</span>
                                    {mediaType && <span className="capitalize">• {mediaType}</span>}
                                    {imdbRating && (
                                        <span className="text-amber-400/90 font-medium">
                                            IMDb {imdbRating}
                                        </span>
                                    )}
                                    {tmdbRating && (
                                        <span className="text-cyan-400/90 font-medium">
                                            TMDB {tmdbRating}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/70 transition-colors shrink-0"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Radial Dial Area */}
                    <div className="relative flex flex-col items-center justify-center pt-2 pb-2 z-10 select-none">
                        <div
                            ref={dialContainerRef}
                            className="relative cursor-pointer touch-none"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            <svg
                                ref={svgRef}
                                viewBox="0 0 280 270"
                                className="w-64 h-[246px] md:w-72 md:h-[278px] drop-shadow-xl overflow-visible"
                            >
                                <defs>
                                    <linearGradient id={tier.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                        {tier.gradientStops.map((stop, idx) => (
                                            <stop key={idx} offset={stop.offset} stopColor={stop.color} />
                                        ))}
                                    </linearGradient>

                                    {/* Handle knob glow */}
                                    <filter id="glow-knob" x="-30%" y="-30%" width="160%" height="160%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={tier.color} floodOpacity="0.8" />
                                    </filter>

                                    {/* Arc track glow */}
                                    <filter id="glow-arc" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={tier.color} floodOpacity="0.5" />
                                    </filter>
                                </defs>

                                {/* Tick marks */}
                                {tickMarks.map((tick) => (
                                    <line
                                        key={tick.id}
                                        x1={tick.p1.x}
                                        y1={tick.p1.y}
                                        x2={tick.p2.x}
                                        y2={tick.p2.y}
                                        stroke={
                                            tick.isPassed
                                                ? tier.color
                                                : tick.isInteger
                                                    ? 'rgba(255, 255, 255, 0.25)'
                                                    : 'rgba(255, 255, 255, 0.08)'
                                        }
                                        strokeWidth={tick.isInteger ? 2.5 : 1.2}
                                        strokeLinecap="round"
                                        className="transition-colors duration-150"
                                    />
                                ))}

                                {/* 3. Numbers at key positions (0, 5, 10) - 5 is now fully visible and centered */}
                                {(() => {
                                    const p0 = polarToCartesian(CX, CY, 126, START_ANGLE);
                                    const p5 = polarToCartesian(CX, CY, 126, START_ANGLE + TOTAL_SPAN / 2);
                                    const p10 = polarToCartesian(CX, CY, 126, END_ANGLE);
                                    return (
                                        <>
                                            <text
                                                x={p0.x}
                                                y={p0.y}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                className="text-[12px] font-bold fill-neutral-400"
                                            >
                                                0
                                            </text>
                                            <text
                                                x={p5.x}
                                                y={p5.y}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                className="text-[12px] font-bold fill-neutral-300"
                                            >
                                                5
                                            </text>
                                            <text
                                                x={p10.x}
                                                y={p10.y}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                className="text-[12px] font-bold fill-neutral-400"
                                            >
                                                10
                                            </text>
                                        </>
                                    );
                                })()}

                                {/* Smoked background groove track */}
                                <path
                                    d={masterArcPath}
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.08)"
                                    strokeWidth={13}
                                    strokeLinecap="round"
                                />

                                {/* 4. Active Progress Arc using strokeDasharray: NEVER flies out or distorts */}
                                {score > 0 && (
                                    <path
                                        d={masterArcPath}
                                        fill="none"
                                        stroke={`url(#${tier.gradientId})`}
                                        strokeWidth={13}
                                        strokeLinecap="round"
                                        strokeDasharray={arcLength}
                                        strokeDashoffset={strokeDashoffset}
                                        filter="url(#glow-arc)"
                                        style={{
                                            transition: 'stroke-dashoffset 40ms linear'
                                        }}
                                    />
                                )}

                                {/* Interactive Knob (Thumb) */}
                                <g
                                    transform={`translate(${knobPos.x}, ${knobPos.y})`}
                                    className="cursor-grab active:cursor-grabbing"
                                >
                                    {/* Outer Halo */}
                                    <circle
                                        r={isDragging ? 18 : 15}
                                        fill={tier.glowColor}
                                        className="transition-all duration-150"
                                    />
                                    {/* Metallic Bezel */}
                                    <circle
                                        r={isDragging ? 13 : 11}
                                        fill="#0a0a0f"
                                        stroke={tier.color}
                                        strokeWidth={3}
                                        filter="url(#glow-knob)"
                                        className="transition-all duration-150"
                                    />
                                    {/* Center LED Jewel */}
                                    <circle
                                        r={4}
                                        fill="#ffffff"
                                    />
                                </g>
                            </svg>

                            {/* Center Readout & Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                {/* Digital Score Readout */}
                                <div className="flex items-baseline">
                                    <span
                                        className="text-5xl md:text-6xl font-black tracking-tight transition-colors duration-300 font-mono"
                                        style={{
                                            color: tier.color,
                                            textShadow: `0 0 25px ${tier.glowColor}`
                                        }}
                                    >
                                        {score.toFixed(1)}
                                    </span>
                                    <span className="text-neutral-500 font-semibold text-sm md:text-base ml-1">
                                        /10
                                    </span>
                                </div>

                                {/* Tier Pill Badge */}
                                <div
                                    className={cn(
                                        "mt-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300 backdrop-blur-md",
                                        tier.badgeBg
                                    )}
                                >
                                    {tier.tag}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="relative flex items-center gap-3 pt-3 mt-1 border-t border-neutral-800/60 z-10">
                        {currentRating !== undefined && onRemoveRating && (
                            <button
                                type="button"
                                onClick={() => {
                                    onRemoveRating();
                                    onClose();
                                }}
                                className="p-2.5 rounded-xl bg-neutral-900/90 hover:bg-red-500/15 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-500/40 transition-colors shrink-0 cursor-pointer"
                                title="Remove your rating"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                onSaveRating(score);
                                onClose();
                            }}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm md:text-base shadow-lg transition-all duration-300 active:scale-[0.98] bg-gradient-to-r hover:opacity-95 cursor-pointer",
                                tier.btnGradient
                            )}
                            style={{
                                boxShadow: `0 0 20px ${tier.glowColor}`
                            }}
                        >
                            <Star size={18} className="fill-white" />
                            <span>Confirm {score.toFixed(1)} Rating</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
