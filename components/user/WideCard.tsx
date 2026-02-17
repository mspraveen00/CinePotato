import React from 'react';
import Image from 'next/image';
import { MoreVertical, Star, Film, Monitor, Tv, Gamepad } from 'lucide-react';
import { ListItem } from '@/lib/store/user-lists-store';
import { IMDbIcon, TMDBLogo, MetacriticIcon, RottenTomatoesIcon, PopcornIcon } from './RatingIcons';

interface WideCardProps {
    item: ListItem;
    actions?: React.ReactNode;
}

export function WideCard({ item, actions }: WideCardProps) {
    const getMediaTypeIcon = () => {
        switch (item.media_type) {
            case 'movie': return <Film className="w-3 h-3" />;
            case 'tv': return <Tv className="w-3 h-3" />;
            case 'game': return <Gamepad className="w-3 h-3" />;
            case 'episode': return <Monitor className="w-3 h-3" />;
            default: return null;
        }
    };

    return (
        <div className="group relative flex bg-neutral-900 rounded-xl overflow-hidden h-[120px] md:h-[180px] border border-neutral-800 hover:border-neutral-700 transition-colors">

            {/* Three-dot menu */}
            {/* Top Right: User Rating & Menu */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                {/* User Rating */}
                {item.rating_user !== undefined && (
                    <div className="flex items-center justify-center w-6 h-6 md:w-10 md:h-10 text-[10px] md:text-base rounded-full bg-primary/20 border-2 border-primary text-primary font-bold shadow-lg shadow-primary/20 backdrop-blur-md">
                        {item.rating_user}
                    </div>
                )}

                {actions || (
                    <button className="p-1.5 rounded-full hover:bg-black/50 text-white/70 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Left: Poster */}
            <div className="relative w-[70px] md:w-[120px] shrink-0 border-r border-neutral-800 z-10">
                {item.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs">
                        No Image
                    </div>
                )}
            </div>

            {/* Right: Backdrop Area */}
            <div className="relative flex-1 flex flex-col">
                {/* Backdrop Background */}
                <div className="absolute inset-0 z-0">
                    {item.backdrop_path && (
                        <Image
                            src={`https://image.tmdb.org/t/p/w1280${item.backdrop_path}`}
                            alt=""
                            fill
                            className="object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-3 md:p-5 md:pl-6 h-full flex flex-col justify-between">

                    {/* Top Section */}
                    <div>
                        <h3 className="text-sm md:text-xl font-bold text-white leading-tight line-clamp-1">{item.title}</h3>
                        <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 text-xs md:text-sm text-neutral-400">
                            <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] md:text-xs font-semibold px-1.5 py-0.5 bg-white/10 rounded">
                                {getMediaTypeIcon()} <span className="hidden md:inline">{item.media_type}</span>
                            </span>
                            <span>•</span>
                            <span>{item.release_year}</span>
                            {item.runtime_or_episodes && (
                                <>
                                    <span>•</span>
                                    <span>{item.runtime_or_episodes}</span>
                                </>
                            )}
                            {item.content_rating && (
                                <>
                                    <span>•</span>
                                    <span className="border border-neutral-700 px-1 rounded text-xs">{item.content_rating}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bottom Ratings Row */}
                    <div className="flex items-center justify-between mt-auto">
                        {/* Public Ratings Group */}
                        <div className="flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-md px-2 py-1 md:px-4 md:py-1.5 rounded-full border border-white/10 shadow-lg">
                            {item.rating_imdb && (
                                <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-medium text-neutral-300">
                                    <IMDbIcon className="w-7 h-4 md:w-9 md:h-5" />
                                    <span className="text-white">{item.rating_imdb.toFixed(1)}</span>
                                </div>
                            )}
                            {item.rating_metacritic && (
                                <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-medium text-neutral-300">
                                    <MetacriticIcon className="w-4 h-4 md:w-5 md:h-5 text-current" />
                                    <span className="text-white">{item.rating_metacritic}</span>
                                </div>
                            )}
                            {item.rating_tmdb && (
                                <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-medium text-neutral-300">
                                    <TMDBLogo className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="text-white">{item.rating_tmdb.toFixed(1)}</span>
                                </div>
                            )}
                            {item.rating_rotten_tomatoes && (
                                <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-medium text-neutral-300">
                                    <RottenTomatoesIcon className="w-4 h-4 md:w-5 md:h-5" fresh={item.rating_rotten_tomatoes >= 60} />
                                    <span className="text-white">{item.rating_rotten_tomatoes}%</span>
                                </div>
                            )}
                            {item.rating_popcornmeter && (
                                <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-medium text-neutral-300">
                                    <PopcornIcon className="w-4 h-4 md:w-5 md:h-5" fresh={item.rating_popcornmeter >= 60} />
                                    <span className="text-white">{item.rating_popcornmeter}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
