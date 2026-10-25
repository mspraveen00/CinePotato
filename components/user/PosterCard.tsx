import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { ListItem, getItemHref } from '@/lib/store/user-lists-store';
import { getMediaImageUrl } from '@/lib/image-utils';

interface PosterCardProps {
    item: ListItem;
    actions?: React.ReactNode;
}

export function PosterCard({ item, actions }: PosterCardProps) {
    return (
        <div className="group relative">
            <Link href={getItemHref(item)} className="block cursor-pointer">
                <div className="aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden relative">
                    {item.poster_path ? (
                        <img
                            src={getMediaImageUrl(item.poster_path, "poster")}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-500 text-xs text-center p-2">
                            No Image
                        </div>
                    )}

                    {/* Rating Badge (User rating prioritized or IMDb) */}
                    {item.rating_user !== undefined ? (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/75 border border-primary/50 backdrop-blur-md px-1.5 py-0.5 rounded text-xs text-primary font-bold z-10 font-mono shadow-md">
                            <Star className="w-3 h-3 text-primary fill-primary" />
                            {item.rating_user.toFixed(1)}
                        </div>
                    ) : item.rating_imdb ? (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-xs text-white font-medium z-10">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {item.rating_imdb.toFixed(1)}
                        </div>
                    ) : null}
                </div>
                <h3 className="mt-2 text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-xs text-neutral-400 capitalize">{item.media_type} • {item.release_year}</p>
            </Link>

            {/* Actions Menu (Moved outside overflow container) */}
            {actions && (
                <div
                    className="absolute top-2 right-2 z-20"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    {actions}
                </div>
            )}
        </div>
    );
}
