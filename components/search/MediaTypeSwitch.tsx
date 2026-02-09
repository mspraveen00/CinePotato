import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MediaType } from '@/types/search';
import { Film, Tv, Gamepad2, User, Clapperboard, Layers } from 'lucide-react';

interface MediaTypeSwitchProps {
    activeType: MediaType;
    onChange: (type: MediaType) => void;
    isAdvanced: boolean;
}

const QUICK_SEARCH_TYPES: { type: MediaType; label: string; icon: any }[] = [
    { type: 'movie', label: 'Movies', icon: Film },
    { type: 'tv', label: 'TV Series', icon: Tv },
    { type: 'game', label: 'Games', icon: Gamepad2 },
    { type: 'person', label: 'People', icon: User },
];

const ADVANCED_SEARCH_TYPES: { type: MediaType; label: string; icon: any }[] = [
    { type: 'movie', label: 'Movies', icon: Film },
    { type: 'tv', label: 'TV Series', icon: Tv },
    { type: 'game', label: 'Games', icon: Gamepad2 },
];

export function MediaTypeSwitch({ activeType, onChange, isAdvanced }: MediaTypeSwitchProps) {
    const types = isAdvanced ? ADVANCED_SEARCH_TYPES : QUICK_SEARCH_TYPES;

    return (
        <div className="flex justify-center w-full">
            <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/5 p-1 rounded-full flex gap-1 relative overflow-hidden shadow-lg">
                {types.map((item) => {
                    const isActive = activeType === item.type;
                    return (
                        <button
                            key={item.type}
                            onClick={() => onChange(item.type)}
                            className={cn(
                                "relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                isActive ? "text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeMediaType"
                                    className="absolute inset-0 bg-white/10 rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
