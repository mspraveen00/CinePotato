import { getTVDetail, getSeasonDetail } from '@/lib/services/tv-service';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // Cache for 1 hour

export default async function SeasonPage({
    params,
}: {
    params: Promise<{ id: string, seasonNumber: string }>
}) {
    const { id, seasonNumber } = await params;

    // Fetch basic TV details just for the name and season reference
    const titleDetail = await getTVDetail(id);
    if (!titleDetail) {
        notFound();
    }

    const seasonNum = parseInt(seasonNumber, 10);
    const episodes = await getSeasonDetail(id, seasonNum);
    const currentSeason = titleDetail.seasons?.find(s => s.seasonNumber === seasonNum);

    if (!episodes || episodes.length === 0) {
        notFound();
    }

    const seasonName = currentSeason?.name || `Season ${seasonNumber}`;

    return (
        <main className="min-h-screen bg-black text-white pb-20 pt-24 px-4 sm:px-8 max-w-5xl mx-auto">
            <Link
                href={`/tv/${id}`}
                className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to {titleDetail.title}</span>
            </Link>

            <header className="mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{seasonName}</h1>
                <p className="text-neutral-400 text-lg">
                    {episodes.length} Episodes {currentSeason?.airDate ? `• Premiered ${new Date(currentSeason.airDate).getFullYear()}` : ''}
                </p>
                {currentSeason?.overview && (
                    <p className="text-neutral-300 mt-4 max-w-3xl leading-relaxed">
                        {currentSeason.overview}
                    </p>
                )}
            </header>

            <div className="space-y-6">
                {episodes.map((ep) => (
                    <div key={ep.id} className="group flex flex-col sm:flex-row gap-6 bg-neutral-900/40 hover:bg-neutral-800/60 p-4 sm:p-6 rounded-2xl border border-neutral-800/50 transition-colors duration-300">
                        {/* Thumbnail */}
                        <div className="w-full sm:w-72 flex-shrink-0 relative overflow-hidden rounded-xl aspect-video bg-neutral-800">
                            {ep.stillPath ? (
                                <img
                                    src={ep.stillPath}
                                    alt={ep.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                    No Image
                                </div>
                            )}
                            {/* Number Badge */}
                            <div className="absolute top-2 left-2 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-sm font-semibold text-white shadow-sm border border-white/10">
                                E{ep.episodeNumber}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-center min-w-0 py-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-amber-500 transition-colors">
                                {ep.episodeNumber}. {ep.name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-400 mb-4">
                                {ep.rating > 0 && (
                                    <div className="flex items-center gap-1.5 font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md">
                                        <Star className="w-4 h-4 fill-current" />
                                        {ep.rating}
                                    </div>
                                )}
                                {ep.airDate && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(ep.airDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                )}
                                {ep.runtime && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{ep.runtime} min</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-base text-neutral-300 leading-relaxed">
                                {ep.overview || "No description available for this episode."}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
