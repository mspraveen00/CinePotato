import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RatingSliderProps {
    value: number;
    onChange: (value: number) => void;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

export function RatingSlider({ value, onChange, enabled, onToggle }: RatingSliderProps) {
    // Simple custom switch since we might not have a UI library installed
    const Toggle = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) => (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/20",
                checked ? "bg-purple-600" : "bg-neutral-700"
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-300">Minimum Rating</label>
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", enabled ? "text-purple-400" : "text-neutral-500")}>
                        {enabled ? `${value}+` : 'Off'}
                    </span>
                    <Toggle checked={enabled} onCheckedChange={onToggle} />
                </div>
            </div>

            <div className={cn("relative h-2 bg-neutral-800 rounded-full select-none", !enabled && "opacity-50 pointer-events-none")}>
                {/* Background track */}
                <div className="absolute inset-0 bg-neutral-800 rounded-full" />

                {/* Active fill from value to end (10) as it's a "Minimum Rating" filter i.e. >= X */}
                <div
                    className="absolute top-0 bottom-0 bg-purple-600 rounded-full"
                    style={{
                        left: `${(value / 10) * 100}%`,
                        right: 0
                    }}
                />

                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {/* Visual thumb */}
                <div
                    className="absolute top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow-lg border border-neutral-200 pointer-events-none z-20"
                    style={{ left: `${(value / 10) * 100}%`, transform: 'translateX(-50%)' }}
                />

                {/* Ticks for 0-10 */}
                <div className="absolute top-4 w-full flex justify-between text-[10px] text-neutral-500 pointer-events-none px-[2px]">
                    {[...Array(11)].map((_, i) => (
                        <span key={i} className="absolute transform -translate-x-1/2" style={{ left: `${i * 10}%` }}>
                            {i}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
