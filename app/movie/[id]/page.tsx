import HeroBanner from '@/components/title/HeroBanner';
import { getMovieDetail } from '@/lib/services/movie-service';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Cache for 1 hour

export default async function MoviePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const titleDetail = await getMovieDetail(id);

    if (!titleDetail) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-neutral-900 text-white pb-20">
            <HeroBanner titleDetail={titleDetail} />

            <div className="container mx-auto px-4 relative z-10 mt-12">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Space for the floating poster (desktop) */}
                    <div className="hidden md:block w-64 flex-shrink-0" />

                    <div className="flex-1 space-y-8">
                        {/* Plot Summary */}
                        <section>
                            <h3 className="text-xl font-bold mb-4">Plot Summary</h3>
                            <p className="text-neutral-300 leading-relaxed text-lg max-w-3xl">
                                {titleDetail.overview}
                            </p>
                        </section>

                        {/* Cast Placeholder */}
                        <section>
                            <h3 className="text-xl font-bold mb-4">Top Cast</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-32 flex-shrink-0">
                                        <div className="aspect-[2/3] bg-neutral-800 rounded-lg mb-2" />
                                        <div className="h-4 w-24 bg-neutral-800 rounded mb-1" />
                                        <div className="h-3 w-16 bg-neutral-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}
