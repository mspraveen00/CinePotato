import React from 'react';
import Image from 'next/image';

export const IMDbIcon = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
        <Image
            src="/icons/imdb.png"
            alt="IMDb"
            fill
            className="object-contain"
            unoptimized
        />
    </div>
);

export const TMDBLogo = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
        <Image
            src="/icons/tmdb.png"
            alt="TMDB"
            fill
            className="object-contain"
            unoptimized
        />
    </div>
);

export const MetacriticIcon = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
        <Image
            src="/icons/metacritic.png"
            alt="Metacritic"
            fill
            className="object-contain"
            unoptimized
        />
    </div>
);

export const RottenTomatoesIcon = ({ className, fresh = true }: { className?: string, fresh?: boolean }) => (
    <div className={`relative ${className}`}>
        <Image
            src={fresh ? "/icons/tomatofresh.png" : "/icons/tomatorotten.png"}
            alt={fresh ? "Fresh" : "Rotten"}
            fill
            className="object-contain"
            unoptimized
        />
    </div>
);

export const PopcornIcon = ({ className, fresh = true }: { className?: string, fresh?: boolean }) => (
    <div className={`relative ${className}`}>
        <Image
            src={fresh ? "/icons/popcornfresh.png" : "/icons/popcornrotten.png"}
            alt={fresh ? "Fresh" : "Rotten"}
            fill
            className="object-contain"
            unoptimized
        />
    </div>
);
