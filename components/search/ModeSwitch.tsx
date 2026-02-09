import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, SlidersHorizontal } from 'lucide-react';

interface ModeSwitchProps {
    isAdvanced: boolean;
    onToggle: (isAdvanced: boolean) => void;
}

export function ModeSwitch({ isAdvanced, onToggle }: ModeSwitchProps) {
    return (
        <div className="flex justify-center w-full mt-4">
            <div className="bg-neutral-900/50 backdrop-blur-md p-1 rounded-full flex relative">
                {/* Active background slider */}
                <motion.div
                    className="absolute top-1 bottom-1 bg-white/10 rounded-full"
                    initial={false}
                    animate={{
                        x: isAdvanced ? '100%' : '0%',
                        width: '50%'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <button
                    onClick={() => onToggle(false)}
                    className={cn(
                        "relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                        !isAdvanced ? "text-white" : "text-neutral-400 hover:text-white"
                    )}
                >
                    <Clock className="w-4 h-4" />
                    Recent
                </button>

                <button
                    onClick={() => onToggle(true)}
                    className={cn(
                        "relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                        isAdvanced ? "text-white" : "text-neutral-400 hover:text-white"
                    )}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Advanced
                </button>
            </div>
        </div>
    );
}
