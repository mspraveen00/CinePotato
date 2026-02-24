/**
 * Utility functions for generating safely sized external CDN image URLs.
 * 
 * We use this to construct standard `<img>` attributes without relying on `next/image`,
 * preventing Vercel free-tier image optimization quota exhaustion.
 */

export type ImagePreset = "thumbnail" | "poster" | "hero" | "fullscreen" | "logo";

type CdnProvider = "tmdb" | "igdb" | "unknown";

const TMDB_SIZES: Record<ImagePreset, string> = {
    thumbnail: "w342",
    poster: "w500",
    hero: "w1280",
    fullscreen: "original",
    logo: "original",
};

const IGDB_SIZES: Record<ImagePreset, string> = {
    thumbnail: "t_thumb",
    poster: "t_cover_big",
    hero: "t_1080p",
    fullscreen: "t_original",
    logo: "t_1080p",
};

/**
 * Determines the CDN provider from a given URL.
 */
function getProvider(url: string): CdnProvider {
    if (url.includes('image.tmdb.org')) return 'tmdb';
    if (url.includes('images.igdb.com')) return 'igdb';
    return 'unknown';
}

/**
 * Given an original TMDB or IGDB URL, safely replace its size path with a predefined preset size.
 * If the URL is already an original source path without sizing components, it injects the size prefix.
 */
export function getResizedImage(url: string, preset: ImagePreset): string {
    if (!url) return "";

    const provider = getProvider(url);

    if (provider === 'tmdb') {
        // TMDB URLs typically look like: https://image.tmdb.org/t/p/original/mXLOHHc1ZpB...
        // We regex match the size segment (e.g. /w500/ or /original/) and replace it
        const sizeString = TMDB_SIZES[preset];
        return url.replace(/\/t\/p\/(w\d+|original)\//, `/t/p/${sizeString}/`);
    }

    if (provider === 'igdb') {
        // IGDB URLs typically look like: https://images.igdb.com/igdb/image/upload/t_1080p/co1r7h.jpg
        const sizeString = IGDB_SIZES[preset];
        return url.replace(/\/upload\/(t_[a-zA-Z0-9_]+)\//, `/upload/${sizeString}/`);
    }

    // Unrecognized URLs are returned as-is
    return url;
}

/**
 * Generate a responsive srcSet string for standard HTML elements.
 * Maps defined presets to their respective widths for `w` descriptors.
 */
export function generateSrcSet(url: string, presets: { preset: ImagePreset; width: number }[]): string {
    if (!url || getProvider(url) === 'unknown') return "";

    return presets.map(({ preset, width }) => {
        const sizedUrl = getResizedImage(url, preset);
        return `${sizedUrl} ${width}w`;
    }).join(", ");
}
