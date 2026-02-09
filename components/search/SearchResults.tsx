import { SearchResult, MediaType } from '@/types/search';
import { Film, Tv, Gamepad2, User, FileText, LayoutGrid, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Assuming generic image component or next/image usage

// Map media types to icons and labels
const MEDIA_ICONS: Record<MediaType, any> = {
    movie: Film,
    tv: Tv,
    game: Gamepad2,
    person: User,
    episode: FileText,
    franchise: LayoutGrid,
};

const MEDIA_COLORS: Record<MediaType, string> = {
    movie: 'text-blue-400',
    tv: 'text-green-400',
    game: 'text-purple-400',
    person: 'text-yellow-400',
    episode: 'text-pink-400',
    franchise: 'text-orange-400',
};

interface SearchResultsProps {
    results: SearchResult[];
    isLoading?: boolean;
}

export function SearchResults({ results, isLoading }: SearchResultsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl mx-auto mt-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-neutral-900/50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center mt-12 text-neutral-500">
                <p>No results found.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto mt-8 space-y-4">
            {results.map((result, index) => {
                const Icon = MEDIA_ICONS[result.mediaType];
                const colorClass = MEDIA_COLORS[result.mediaType];

                return (
                    <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex gap-4 p-4 bg-neutral-900/50 hover:bg-neutral-800/80 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
                    >
                        {/* Placeholder for Poster/Image - In a real app we'd have images */}
                        <div className="w-16 h-24 bg-neutral-800 rounded-lg flex-shrink-0 flex items-center justify-center text-neutral-600">
                            <Icon className="w-8 h-8 opacity-20" />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-4 h-4 ${colorClass}`} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>
                                    {result.mediaType}
                                </span>
                                {result.rating && (
                                    <span className="flex items-center gap-1 text-xs text-yellow-500 ml-auto">
                                        <Star className="w-3 h-3 fill-yellow-500" />
                                        {result.rating.toFixed(1)}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-white truncate pr-4 group-hover:text-primary transition-colors">
                                {result.title}
                            </h3>

                            {/* Specific Metadata Display */}
                            <div className="text-sm text-neutral-400 mt-1 flex items-center gap-3">
                                {result.releaseDate && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(result.releaseDate).getFullYear()}
                                    </span>
                                )}

                                {result.mediaType === 'episode' && (
                                    <span className="text-neutral-500">
                                        {result.parentSeriesTitle} • S{result.seasonNumber} E{result.episodeNumber}
                                    </span>
                                )}

                                {result.mediaType === 'person' && (
                                    <span>Person</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
