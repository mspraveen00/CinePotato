import HeroBanner from '@/components/title/HeroBanner';
import { getGameDetail } from '@/lib/services/game-detail-service';
import { notFound } from 'next/navigation';
import { Gamepad2, Calendar, Star } from 'lucide-react';

export const revalidate = 3600; // Cache for 1 hour

export default async function GamePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // We need to fetch the detail using our service
    // Note: getGameDetail imports fetchIGDB which uses server-side env vars.
    // This is a Server Component, so it's fine.
    // However, if getGameDetail was importing from a client-side module it would fail.
    // But we ensured it imports from lib/api/igdb directly.

    // Correction: In previous step I implemented getGameDetail to dynamically import to be safe OR just import.
    // Let's check the file content if needed, but assuming standard import works.

    const titleDetail = await getGameDetail(id);

    if (!titleDetail) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-neutral-900 text-white pb-20">
            <HeroBanner titleDetail={titleDetail} />

            <div className="container mx-auto px-4 relative z-10 mt-12">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Space for the floating poster (desktop) mechanism handled in HeroBanner usually, 
                        or we need to replicate the layout. 
                        Looking at MoviePage, there is a placeholder div:
                        <div className="hidden md:block w-64 flex-shrink-0" />
                    */}
                    <div className="hidden md:block w-64 flex-shrink-0" />

                    <div className="flex-1 space-y-8">
                        {/* Plot Summary */}
                        <section>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Gamepad2 className="w-5 h-5 text-purple-500" />
                                About
                            </h3>
                            <p className="text-neutral-300 leading-relaxed text-lg max-w-3xl">
                                {titleDetail.overview}
                            </p>
                        </section>

                        {/* Metadata Grid */}
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                            <div>
                                <h4 className="text-sm text-neutral-500 mb-1">Release Year</h4>
                                <p className="text-lg font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    {titleDetail.releaseYear || "N/A"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm text-neutral-500 mb-1">Rating</h4>
                                <p className="text-lg font-medium flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    {titleDetail.rating ? titleDetail.rating.toFixed(1) : "N/A"}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <h4 className="text-sm text-neutral-500 mb-1">Genres</h4>
                                <div className="flex flex-wrap gap-2">
                                    {titleDetail.genres.map(g => (
                                        <span key={g} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}
