import HeroBanner from '@/components/title/HeroBanner';
import { getTVDetail } from '@/lib/services/tv-service';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SeasonsSection from '@/components/title/SeasonsSection';

export const revalidate = 3600; // Cache for 1 hour

export default async function TVPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const titleDetail = await getTVDetail(id);

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

                        {/* Seasons */}
                        {(titleDetail.seasons && titleDetail.seasons.length > 0) || (titleDetail.episodeGroups && titleDetail.episodeGroups.length > 0) ? (
                            <SeasonsSection
                                titleId={titleDetail.id}
                                seasons={titleDetail.seasons}
                                episodeGroups={titleDetail.episodeGroups}
                            />
                        ) : null}

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
                                        <Link href={`/person/${actor.id}`} key={actor.id} className="w-32 flex-shrink-0 group cursor-pointer block">
                                            <div className="overflow-hidden rounded-lg mb-2">
                                                {actor.profileImageUrl ? (
                                                    <img
                                                        src={actor.profileImageUrl}
                                                        alt={actor.name}
                                                        className="w-full aspect-[2/3] object-cover bg-neutral-800 group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full aspect-[2/3] bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm group-hover:bg-neutral-700 transition-colors duration-300">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-medium text-sm text-balance line-clamp-2 group-hover:text-white transition-colors">{actor.name}</p>
                                            <p className="text-xs text-neutral-400 text-balance line-clamp-2">{actor.character}</p>
                                        </Link>
                                    ))}
                                    {/* View All Card */}
                                    <Link
                                        href={`/tv/${titleDetail.id}/cast`}
                                        className="w-32 flex-shrink-0 flex flex-col group cursor-pointer"
                                    >
                                        <div className="w-full aspect-[2/3] bg-neutral-800/50 hover:bg-neutral-800 transition-colors border border-neutral-800 rounded-lg mb-2 flex flex-col items-center justify-center text-neutral-400 group-hover:text-white">
                                            <div className="bg-neutral-900 rounded-full p-3 mb-2 group-hover:scale-110 transition-transform">
                                                <ArrowRight size={24} />
                                            </div>
                                            <span className="text-sm font-medium">View All</span>
                                        </div>
                                        <p className="font-medium text-sm text-transparent select-none">View All</p>
                                        <p className="text-xs text-transparent select-none">View All</p>
                                    </Link>
                                </div>
                            </section>
                        )}

                        {/* Top Crew */}
                        {titleDetail.crew && titleDetail.crew.length > 0 && (
                            <section className="relative">
                                <h3 className="text-xl font-bold mb-4">Top Crew</h3>
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
                                    {titleDetail.crew.map((crewMember) => (
                                        <Link href={`/person/${crewMember.id}`} key={`${crewMember.id}-${crewMember.job}`} className="w-32 flex-shrink-0 group cursor-pointer block">
                                            <div className="overflow-hidden rounded-lg mb-2">
                                                {crewMember.profileImageUrl ? (
                                                    <img
                                                        src={crewMember.profileImageUrl}
                                                        alt={crewMember.name}
                                                        className="w-full aspect-[2/3] object-cover bg-neutral-800 group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full aspect-[2/3] bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm group-hover:bg-neutral-700 transition-colors duration-300">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-medium text-sm text-balance line-clamp-2 group-hover:text-white transition-colors">{crewMember.name}</p>
                                            <p className="text-xs text-neutral-400 text-balance line-clamp-2">{crewMember.job}</p>
                                        </Link>
                                    ))}
                                    {/* View All Card */}
                                    <Link
                                        href={`/tv/${titleDetail.id}/crew`}
                                        className="w-32 flex-shrink-0 flex flex-col group cursor-pointer"
                                    >
                                        <div className="w-full aspect-[2/3] bg-neutral-800/50 hover:bg-neutral-800 transition-colors border border-neutral-800 rounded-lg mb-2 flex flex-col items-center justify-center text-neutral-400 group-hover:text-white">
                                            <div className="bg-neutral-900 rounded-full p-3 mb-2 group-hover:scale-110 transition-transform">
                                                <ArrowRight size={24} />
                                            </div>
                                            <span className="text-sm font-medium">View All</span>
                                        </div>
                                        <p className="font-medium text-sm text-transparent select-none">View All</p>
                                        <p className="text-xs text-transparent select-none">View All</p>
                                    </Link>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
