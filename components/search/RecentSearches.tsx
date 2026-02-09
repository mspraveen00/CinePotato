import { Clock, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecentSearchesProps {
    searches: string[];
    onSelect: (query: string) => void;
    onClear: () => void;
    onRemove: (query: string) => void;
}

export function RecentSearches({ searches, onSelect, onClear, onRemove }: RecentSearchesProps) {
    if (searches.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-neutral-400 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                </h3>
                <button
                    onClick={onClear}
                    className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                    Clear All
                </button>
            </div>

            <div className="bg-neutral-900/50 border border-white/5 rounded-xl overflow-hidden">
                <AnimatePresence>
                    {searches.map((query) => (
                        <motion.div
                            key={query}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="group flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                            onClick={() => onSelect(query)}
                        >
                            <div className="flex items-center gap-3">
                                <Search className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                                <span className="text-neutral-300 group-hover:text-white transition-colors">
                                    {query}
                                </span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(query);
                                }}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full transition-all"
                            >
                                <X className="w-4 h-4 text-neutral-400" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
