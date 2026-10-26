import { fetchTMDB } from '@/lib/api/tmdb';
import {
    CollectionDetail,
    DetailedCollectionMovie,
    CollectionStats,
    CollectionCastMember,
    CollectionDirector,
    CollectionImage
} from '@/types/collection';

interface TMDBCollectionRawPart {
    id: number;
    title: string;
    original_title?: string;
    overview: string;
    release_date?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids?: number[];
}

interface TMDBCollectionRawImage {
    file_path: string;
    aspect_ratio: number;
    width: number;
    height: number;
    vote_average: number;
    vote_count: number;
    iso_639_1?: string | null;
}

interface TMDBCollectionResponse {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    parts: TMDBCollectionRawPart[];
    images?: {
        backdrops?: TMDBCollectionRawImage[];
        posters?: TMDBCollectionRawImage[];
    };
}

interface TMDBMovieDetailWithCredits {
    id: number;
    title: string;
    runtime: number | null;
    budget: number;
    revenue: number;
    genres?: { id: number; name: string }[];
    credits?: {
        cast?: {
            id: number;
            name: string;
            character: string;
            profile_path: string | null;
            order: number;
        }[];
        crew?: {
            id: number;
            name: string;
            job: string;
            department: string;
        }[];
    };
}

function formatCurrency(amount: number): string {
    if (!amount || amount <= 0) return 'N/A';
    if (amount >= 1e9) {
        return `$${(amount / 1e9).toFixed(2)}B`;
    }
    if (amount >= 1e6) {
        return `$${(amount / 1e6).toFixed(1)}M`;
    }
    if (amount >= 1e3) {
        return `$${(amount / 1e3).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
}

function formatMinutes(minutes: number): string {
    if (!minutes || minutes <= 0) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
}

export async function getCollectionDetail(id: string | number): Promise<CollectionDetail | null> {
    try {
        const collection = await fetchTMDB<TMDBCollectionResponse>(
            `/collection/${id}?append_to_response=images`,
            { next: { revalidate: 86400 } }
        );

        if (!collection || !collection.id) {
            return null;
        }

        // Parallel fetch individual movie details to get budget, revenue, runtime, director, cast
        const rawParts = collection.parts || [];
        const movieDetailsMap = new Map<number, TMDBMovieDetailWithCredits>();

        await Promise.all(
            rawParts.map(async (part) => {
                try {
                    const detail = await fetchTMDB<TMDBMovieDetailWithCredits>(
                        `/movie/${part.id}?append_to_response=credits`,
                        { next: { revalidate: 86400 } }
                    );
                    movieDetailsMap.set(part.id, detail);
                } catch (err) {
                    console.warn(`Failed to fetch movie detail for collection part ${part.id}:`, err);
                }
            })
        );

        // Process parts with enriched data
        const enrichedParts: DetailedCollectionMovie[] = rawParts.map((part) => {
            const detail = movieDetailsMap.get(part.id);
            const runtime = detail?.runtime || 0;
            const budget = detail?.budget || 0;
            const revenue = detail?.revenue || 0;
            const director = detail?.credits?.crew?.find(c => c.job === 'Director')?.name;
            const topCast = detail?.credits?.cast?.slice(0, 5).map(c => ({
                id: c.id,
                name: c.name,
                character: c.character || 'Unknown',
                profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
            })) || [];
            const genres = detail?.genres?.map(g => g.name) || [];

            const releaseYear = part.release_date ? new Date(part.release_date).getFullYear() : null;

            return {
                id: part.id,
                title: part.title,
                originalTitle: part.original_title,
                overview: part.overview || '',
                posterPath: part.poster_path ? `https://image.tmdb.org/t/p/w500${part.poster_path}` : null,
                backdropPath: part.backdrop_path ? `https://image.tmdb.org/t/p/original${part.backdrop_path}` : null,
                releaseDate: part.release_date || null,
                releaseYear: isNaN(releaseYear as number) ? null : releaseYear,
                rating: part.vote_average ? parseFloat(part.vote_average.toFixed(1)) : 0,
                voteCount: part.vote_count || 0,
                runtime,
                formattedRuntime: formatMinutes(runtime),
                budget,
                revenue,
                formattedRevenue: formatCurrency(revenue),
                formattedBudget: formatCurrency(budget),
                director,
                topCast,
                genres,
            };
        });

        // Default sort by release date ascending (chronological)
        enrichedParts.sort((a, b) => {
            if (!a.releaseDate) return 1;
            if (!b.releaseDate) return -1;
            return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
        });

        // Calculate aggregate statistics
        let totalRevenue = 0;
        let totalBudget = 0;
        let totalRuntimeMinutes = 0;
        let totalVotes = 0;
        let weightedScoreSum = 0;

        let highestGrossingMovie: DetailedCollectionMovie | undefined;
        let highestRatedMovie: DetailedCollectionMovie | undefined;

        const actorCountMap = new Map<number, { name: string; character: string; profilePath: string | null; count: number; titles: string[] }>();
        const directorCountMap = new Map<string, { count: number; titles: string[] }>();

        for (const part of enrichedParts) {
            totalRevenue += part.revenue;
            totalBudget += part.budget;
            totalRuntimeMinutes += part.runtime;

            if (part.voteCount > 0 && part.rating > 0) {
                weightedScoreSum += part.rating * part.voteCount;
                totalVotes += part.voteCount;
            }

            // Highest grossing
            if (part.revenue > 0 && (!highestGrossingMovie || part.revenue > highestGrossingMovie.revenue)) {
                highestGrossingMovie = part;
            }

            // Highest rated (min 50 votes to prevent skewed 10/10 from 1 vote)
            if (part.rating > 0 && part.voteCount >= 50 && (!highestRatedMovie || part.rating > highestRatedMovie.rating)) {
                highestRatedMovie = part;
            }

            // Track director
            if (part.director) {
                const existing = directorCountMap.get(part.director);
                if (existing) {
                    existing.count += 1;
                    existing.titles.push(part.title);
                } else {
                    directorCountMap.set(part.director, { count: 1, titles: [part.title] });
                }
            }

            // Track top recurring cast
            const detail = movieDetailsMap.get(part.id);
            const castList = detail?.credits?.cast?.slice(0, 12) || [];
            for (const c of castList) {
                const existing = actorCountMap.get(c.id);
                if (existing) {
                    existing.count += 1;
                    if (!existing.titles.includes(part.title)) {
                        existing.titles.push(part.title);
                    }
                } else {
                    actorCountMap.set(c.id, {
                        name: c.name,
                        character: c.character || '',
                        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
                        count: 1,
                        titles: [part.title],
                    });
                }
            }
        }

        // Release span calculation (e.g. 2001 - 2011)
        const yearsWithDates = enrichedParts
            .map(p => p.releaseYear)
            .filter((y): y is number => y !== null && !isNaN(y));

        let releaseSpan = 'N/A';
        if (yearsWithDates.length > 0) {
            const minYear = Math.min(...yearsWithDates);
            const maxYear = Math.max(...yearsWithDates);
            releaseSpan = minYear === maxYear ? `${minYear}` : `${minYear} – ${maxYear}`;
        }

        const averageRating = totalVotes > 0 ? parseFloat((weightedScoreSum / totalVotes).toFixed(1)) : 0;
        const avgRuntime = enrichedParts.length > 0 ? Math.round(totalRuntimeMinutes / enrichedParts.length) : 0;

        const stats: CollectionStats = {
            totalFilms: enrichedParts.length,
            totalRevenue,
            totalBudget,
            formattedRevenue: formatCurrency(totalRevenue),
            formattedBudget: formatCurrency(totalBudget),
            totalRuntimeMinutes,
            formattedTotalRuntime: formatMinutes(totalRuntimeMinutes),
            averageRuntimeMinutes: avgRuntime,
            formattedAverageRuntime: formatMinutes(avgRuntime),
            averageRating,
            releaseSpan,
            highestGrossingFilm: highestGrossingMovie ? {
                id: highestGrossingMovie.id,
                title: highestGrossingMovie.title,
                revenue: highestGrossingMovie.revenue,
                formattedRevenue: highestGrossingMovie.formattedRevenue,
                posterPath: highestGrossingMovie.posterPath,
            } : undefined,
            highestRatedFilm: highestRatedMovie ? {
                id: highestRatedMovie.id,
                title: highestRatedMovie.title,
                rating: highestRatedMovie.rating,
                posterPath: highestRatedMovie.posterPath,
            } : undefined,
        };

        // Recurring cast: sorted by count descending (films appeared in), minimum 2 appearances if multiple films exist
        const recurringCast: CollectionCastMember[] = Array.from(actorCountMap.entries())
            .map(([id, item]) => ({
                id,
                name: item.name,
                character: item.character,
                profilePath: item.profilePath,
                filmCount: item.count,
                movieTitles: item.titles,
            }))
            .sort((a, b) => b.filmCount - a.filmCount)
            .slice(0, 16);

        // Directors
        const directors: CollectionDirector[] = Array.from(directorCountMap.entries())
            .map(([name, item]) => ({
                name,
                filmCount: item.count,
                movieTitles: item.titles,
            }))
            .sort((a, b) => b.filmCount - a.filmCount);

        // Process images
        const backdrops: CollectionImage[] = (collection.images?.backdrops || [])
            .sort((a, b) => b.vote_average - a.vote_average)
            .map(b => ({
                filePath: `https://image.tmdb.org/t/p/original${b.file_path}`,
                aspectRatio: b.aspect_ratio,
                width: b.width,
                height: b.height,
                voteAverage: b.vote_average,
                voteCount: b.vote_count,
                iso_639_1: b.iso_639_1,
            }));

        const posters: CollectionImage[] = (collection.images?.posters || [])
            .sort((a, b) => (b.vote_count * b.vote_average) - (a.vote_count * a.vote_average))
            .map(p => ({
                filePath: `https://image.tmdb.org/t/p/original${p.file_path}`,
                aspectRatio: p.aspect_ratio,
                width: p.width,
                height: p.height,
                voteAverage: p.vote_average,
                voteCount: p.vote_count,
                iso_639_1: p.iso_639_1,
            }));

        return {
            id: collection.id,
            name: collection.name,
            overview: collection.overview || '',
            posterPath: collection.poster_path ? `https://image.tmdb.org/t/p/w780${collection.poster_path}` : null,
            backdropPath: collection.backdrop_path ? `https://image.tmdb.org/t/p/original${collection.backdrop_path}` : null,
            parts: enrichedParts,
            stats,
            recurringCast,
            directors,
            images: {
                backdrops,
                posters,
            },
        };
    } catch (error) {
        console.error(`Error fetching collection detail for ID ${id}:`, error);
        return null;
    }
}
