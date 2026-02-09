import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    autoFocus?: boolean;
}

export function SearchBar({ value, onChange, onClear, autoFocus = true }: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className="relative w-full max-w-2xl mx-auto group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>

            <div className="relative bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-4 py-3 shadow-2xl transition-all duration-300 group-focus-within:border-white/20 group-focus-within:bg-neutral-900/95">
                <Search className="w-5 h-5 text-neutral-400 group-focus-within:text-white transition-colors" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search movies, TV shows, games..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500 px-3 text-lg"
                />
                {value && (
                    <button
                        onClick={() => {
                            onClear();
                            inputRef.current?.focus();
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-neutral-400 hover:text-white" />
                    </button>
                )}
            </div>
        </div>
    );
}
