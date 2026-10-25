import React from 'react';
import Link from 'next/link';
import { KnownForCredit } from '@/types/title';

interface KnownForSectionProps {
    credits: KnownForCredit[];
}

export default function KnownForSection({ credits }: KnownForSectionProps) {
    if (!credits || credits.length === 0) {
        return null;
    }

    return (
        <section className="relative">
            <h3 className="text-xl font-bold mb-4">Known For</h3>
            {/* 
              Negative horizontal margins pull the container to both edges of the screen.
              Padding horizontal ensures the first/last items aren't stuck to the absolute edge.
              Mask image creates a fade effect on both sides.
            */}
            <div
                className="flex gap-4 overflow-x-auto pt-2 pb-4 scrollbar-hide pl-1.5 pr-8 [-webkit-mask-image:linear-gradient(to_right,black_0%,black_calc(100%-64px),transparent_100%)] [mask-image:linear-gradient(to_right,black_0%,black_calc(100%-64px),transparent_100%)]"
            >
                {credits.map((item) => {
                    const href = item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;

                    return (
                        <Link
                            href={href}
                            key={`${item.mediaType}-${item.id}`}
                            className="w-[140px] sm:w-[155px] md:w-[165px] flex-shrink-0 group cursor-pointer block"
                        >
                            <div className="overflow-hidden rounded-lg mb-2">
                                {item.posterUrl ? (
                                    <img
                                        src={item.posterUrl}
                                        alt={item.title}
                                        className="w-full aspect-[2/3] object-cover bg-neutral-800 group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full aspect-[2/3] bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm group-hover:bg-neutral-700 transition-colors duration-300">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <p className="font-medium text-sm text-balance line-clamp-2 group-hover:text-white transition-colors">
                                {item.title}
                            </p>
                            {item.role && (
                                <p className="text-xs text-neutral-400 text-balance line-clamp-2">
                                    {item.role}
                                </p>
                            )}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
