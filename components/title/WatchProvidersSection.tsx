'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WatchProvidersData, WatchProviderItem } from '@/types/title';
import { Tv, ExternalLink, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchProvidersSectionProps {
    watchProviders: WatchProvidersData;
    title: string;
}

const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
    US: { name: 'United States', flag: '🇺🇸' },
    IN: { name: 'India', flag: '🇮🇳' },
    GB: { name: 'United Kingdom', flag: '🇬🇧' },
    CA: { name: 'Canada', flag: '🇨🇦' },
    AU: { name: 'Australia', flag: '🇦🇺' },
    DE: { name: 'Germany', flag: '🇩🇪' },
    FR: { name: 'France', flag: '🇫🇷' },
    JP: { name: 'Japan', flag: '🇯🇵' },
    BR: { name: 'Brazil', flag: '🇧🇷' },
    MX: { name: 'Mexico', flag: '🇲🇽' },
    ES: { name: 'Spain', flag: '🇪🇸' },
    IT: { name: 'Italy', flag: '🇮🇹' },
    NL: { name: 'Netherlands', flag: '🇳🇱' },
    KR: { name: 'South Korea', flag: '🇰🇷' },
    SE: { name: 'Sweden', flag: '🇸🇪' },
    NO: { name: 'Norway', flag: '🇳🇴' },
    NZ: { name: 'New Zealand', flag: '🇳🇿' },
};

const PRIORITY_COUNTRIES = ['US', 'IN', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR', 'MX'];

export default function WatchProvidersSection({ watchProviders, title }: WatchProvidersSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    const availableCountries = useMemo(() => {
        if (!watchProviders?.results) return [];
        const keys = Object.keys(watchProviders.results);
        return keys.sort((a, b) => {
            const aIdx = PRIORITY_COUNTRIES.indexOf(a);
            const bIdx = PRIORITY_COUNTRIES.indexOf(b);
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [watchProviders]);

    const initialCountry = useMemo(() => {
        if (availableCountries.includes('US')) return 'US';
        if (availableCountries.includes('IN')) return 'IN';
        return availableCountries[0] || 'US';
    }, [availableCountries]);

    const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);

    if (availableCountries.length === 0) return null;

    const countryData = watchProviders.results[selectedCountry];

    // Combine flatrate, free, and ads into "Stream" with deduplication
    const streamProviders = useMemo(() => {
        if (!countryData) return [];
        const combined: WatchProviderItem[] = [
            ...(countryData.flatrate || []),
            ...(countryData.free || []),
            ...(countryData.ads || []),
        ];
        const seen = new Set<number>();
        return combined.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });
    }, [countryData]);

    const rentProviders = countryData?.rent || [];
    const buyProviders = countryData?.buy || [];

    const hasAnyProviders = streamProviders.length > 0 || rentProviders.length > 0 || buyProviders.length > 0;
    const countryInfo = COUNTRY_NAMES[selectedCountry] || { name: selectedCountry, flag: '🌐' };

    return (
        <section className="relative rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm transition-colors hover:border-neutral-700/80">
            {/* Clickable Dropdown Header Bar */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left cursor-pointer focus:outline-none select-none group"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Tv size={17} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                                Where to Watch
                            </h3>
                            <span className="text-[10px] sm:text-xs text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-full border border-neutral-700/60 hidden sm:inline-block">
                                {countryInfo.flag} {countryInfo.name}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                            {isOpen ? `Showing availability for ${title}` : 'Click to expand streaming, rent & purchase options'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {/* Collapsed Mini Logo Previews */}
                    {!isOpen && streamProviders.length > 0 && (
                        <div className="hidden sm:flex items-center -space-x-1.5 overflow-hidden">
                            {streamProviders.slice(0, 4).map((p) => (
                                <img
                                    key={p.id}
                                    src={p.logoPath}
                                    alt={p.name}
                                    className="w-6 h-6 rounded-md object-cover border border-neutral-800 shadow-sm"
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800/80 group-hover:bg-neutral-700 transition-colors text-neutral-300 group-hover:text-white">
                        <ChevronDown
                            size={18}
                            className={cn('transition-transform duration-300', isOpen && 'rotate-180')}
                        />
                    </div>
                </div>
            </button>

            {/* Expandable Dropdown Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-5 md:px-6 md:pb-6 pt-1 border-t border-neutral-800/80">
                            {/* Region Picker Row */}
                            <div className="flex items-center justify-between gap-3 mb-5 pt-3">
                                <span className="text-xs text-neutral-400">
                                    Select Region:
                                </span>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Globe size={13} className="text-neutral-400" />
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        className="bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-neutral-700 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                                        aria-label="Select country for watch providers"
                                    >
                                        {availableCountries.map((code) => {
                                            const info = COUNTRY_NAMES[code];
                                            return (
                                                <option key={code} value={code} className="bg-neutral-900 text-white">
                                                    {info ? `${info.flag} ${info.name}` : code}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* Provider Categories */}
                            {hasAnyProviders ? (
                                <div className="space-y-4">
                                    {/* Stream (Subscriptions / Free) */}
                                    {streamProviders.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                                                    Stream
                                                </span>
                                                <span className="text-[10px] text-neutral-500">Subscription & Free</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {streamProviders.map((provider) => (
                                                    <ProviderCard
                                                        key={provider.id}
                                                        provider={provider}
                                                        link={countryData?.link}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Rent */}
                                    {rentProviders.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                                                    Rent
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {rentProviders.map((provider) => (
                                                    <ProviderCard
                                                        key={provider.id}
                                                        provider={provider}
                                                        link={countryData?.link}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Buy */}
                                    {buyProviders.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                                                    Buy
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {buyProviders.map((provider) => (
                                                    <ProviderCard
                                                        key={provider.id}
                                                        provider={provider}
                                                        link={countryData?.link}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-neutral-400 text-xs sm:text-sm">
                                    <p>No streaming or purchase options reported in {countryInfo.flag} {countryInfo.name}.</p>
                                    <p className="text-neutral-500 text-xs mt-1">Try switching to another region above.</p>
                                </div>
                            )}

                            {/* JustWatch Attribution Footer */}
                            {countryData?.link && (
                                <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
                                    <span>Streaming data provided by <strong className="text-neutral-400 font-semibold">JustWatch</strong></span>
                                    <a
                                        href={countryData.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-amber-400/80 hover:text-amber-300 transition-colors"
                                        title="View all watch options on JustWatch"
                                    >
                                        <span>Check all options</span>
                                        <ExternalLink size={10} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

function ProviderCard({ provider, link }: { provider: WatchProviderItem; link?: string }) {
    const content = (
        <div className="group flex flex-col items-center gap-1.5 cursor-pointer">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700/60 shadow-md group-hover:scale-105 group-hover:border-amber-400/60 group-hover:shadow-amber-400/10 transition-all duration-200 flex items-center justify-center">
                <img
                    src={provider.logoPath}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
            <span className="text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-neutral-200 transition-colors line-clamp-1 max-w-[64px] sm:max-w-[76px] text-center">
                {provider.name}
            </span>
        </div>
    );

    if (link) {
        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title={`Watch on ${provider.name}`}
            >
                {content}
            </a>
        );
    }

    return content;
}
