import { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    label: string;
    value: string;
}

interface SearchableMultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    label?: string;
}

export function SearchableMultiSelect({ options, selected, onChange, placeholder = "Select...", label }: SearchableMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(s => s !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const removeSelected = (e: React.MouseEvent, value: string) => {
        e.stopPropagation();
        onChange(selected.filter(s => s !== value));
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="text-sm font-medium text-neutral-300 mb-2 block">{label}</label>}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-neutral-800 rounded-lg min-h-[42px] px-3 py-2 cursor-pointer border border-transparent transition-all",
                    isOpen ? "ring-1 ring-white/20 border-white/10" : "hover:bg-neutral-700"
                )}
            >
                <div className="flex flex-wrap gap-2 items-center">
                    {selected.length === 0 && <span className="text-neutral-500 text-sm">{placeholder}</span>}

                    {selected.map(value => {
                        const opt = options.find(o => o.value === value);
                        return (
                            <span key={value} className="bg-neutral-700 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                {opt?.label || value}
                                <X
                                    className="w-3 h-3 text-neutral-400 hover:text-white cursor-pointer"
                                    onClick={(e) => removeSelected(e, value)}
                                />
                            </span>
                        );
                    })}
                </div>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-neutral-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-neutral-800 rounded-md py-1.5 pl-9 pr-3 text-sm text-white border-none focus:ring-1 focus:ring-white/20"
                                />
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelect(option.value)}
                                        className="px-4 py-2 hover:bg-white/5 cursor-pointer flex items-center justify-between group"
                                    >
                                        <span className={cn("text-sm", selected.includes(option.value) ? "text-white font-medium" : "text-neutral-400 group-hover:text-neutral-200")}>
                                            {option.label}
                                        </span>
                                        {selected.includes(option.value) && (
                                            <Check className="w-4 h-4 text-purple-400" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-neutral-500 text-center">
                                    No results found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
