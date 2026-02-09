import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FilterChipsProps {
    options: { label: string; value: string | number }[];
    selected: (string | number)[];
    onChange: (selected: (string | number)[]) => void;
    multiSelect?: boolean;
    variant?: 'wrap' | 'carousel';
}

export function FilterChips({ options, selected, onChange, multiSelect = true, variant = 'wrap' }: FilterChipsProps) {
    const handleSelect = (value: string | number) => {
        if (multiSelect) {
            if (selected.includes(value)) {
                onChange(selected.filter((v) => v !== value));
            } else {
                onChange([...selected, value]);
            }
        } else {
            onChange(selected.includes(value) ? [] : [value]);
        }
    };

    const containerClass = variant === 'carousel'
        ? "flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-2 px-2"
        : "flex flex-wrap gap-2";

    return (
        <div className={containerClass}>
            {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                    <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex-shrink-0",
                            isSelected
                                ? "bg-white text-black border-white"
                                : "bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-neutral-200"
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
