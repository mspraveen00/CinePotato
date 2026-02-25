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
        <main className="min-h-screen bg-black text-white pb-20 overflow-x-hidden">
            <HeroBanner titleDetail={titleDetail} />

            <div className="container mx-auto px-4 relative z-10 mt-12">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Space for the floating poster (desktop) */}
                    <div className="hidden md:block w-64 flex-shrink-0" />

                    <div className="flex-1 min-w-0 space-y-8">
                        {/* Plot Summary */}
                        <section>
                            <h3 className="text-xl font-bold mb-4">Plot Summary</h3>
                            <p className="text-neutral-300 leading-relaxed text-lg max-w-3xl">
                                {titleDetail.overview}
                            </p>
                        </section>

                        {/* Top Cast */}
                        {titleDetail.cast && titleDetail.cast.length > 0 && (
                            <section className="relative">
                                <h3 className="text-xl font-bold mb-4">Top Cast</h3>
                                {/* 
                                  Negative horizontal margins pull the container to both edges of the screen.
                                  Padding horizontal ensures the first/last items aren't stuck to the absolute edge.
                                  Mask image creates a fade effect on both sides.
                                */}
                                <div
                                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]"
                                    style={{
                                        maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                                    }}
                                >
                                    {titleDetail.cast.map((actor) => (
                                        <div key={actor.id} className="w-32 flex-shrink-0">
                                            {actor.profileImageUrl ? (
                                                <img
                                                    src={actor.profileImageUrl}
                                                    alt={actor.name}
                                                    className="w-full aspect-[2/3] object-cover rounded-lg mb-2 bg-neutral-800"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full aspect-[2/3] bg-neutral-800 rounded-lg mb-2 flex items-center justify-center text-neutral-500 text-sm">
                                                    No Image
                                                </div>
                                            )}
                                            <p className="font-medium text-sm text-balance line-clamp-2">{actor.name}</p>
                                            <p className="text-xs text-neutral-400 text-balance line-clamp-2">{actor.character}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
