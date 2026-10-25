import HeroBanner from '@/components/title/HeroBanner';
import KnownForSection from '@/components/person/KnownForSection';
import { getPersonDetail } from '@/lib/services/person-service';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Cache for 1 hour

export default async function PersonPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const titleDetail = await getPersonDetail(id);

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

                    <div className="flex-1 space-y-8 min-w-0">
                        {/* Biography */}
                        <section>
                            <h3 className="text-xl font-bold mb-4">Biography</h3>
                            <p className="text-neutral-300 leading-relaxed text-lg max-w-3xl whitespace-pre-line">
                                {titleDetail.overview || "No biography available."}
                            </p>
                        </section>

                        {/* Known For Section */}
                        {titleDetail.knownFor && titleDetail.knownFor.length > 0 && (
                            <KnownForSection credits={titleDetail.knownFor} />
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
