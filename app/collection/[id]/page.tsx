import { getCollectionDetail } from '@/lib/services/collection-service';
import CollectionHero from '@/components/collection/CollectionHero';
import CollectionStatsBar from '@/components/collection/CollectionStatsBar';
import CollectionInteractiveSection from '@/components/collection/CollectionInteractiveSection';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 86400; // Cache collection page for 24 hours

interface CollectionPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
    const { id } = await params;
    const collection = await getCollectionDetail(id);

    if (!collection) {
        return {
            title: 'Collection Not Found | CinePotato',
        };
    }

    const title = `${collection.name} | CinePotato`;
    const description = collection.overview || `Explore the complete ${collection.name} franchise on CinePotato.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: collection.backdropPath
                ? [collection.backdropPath]
                : collection.posterPath
                ? [collection.posterPath]
                : [],
        },
    };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { id } = await params;
    const collection = await getCollectionDetail(id);

    if (!collection) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white pb-24 overflow-x-hidden">
            <CollectionHero collection={collection} />
            <CollectionStatsBar stats={collection.stats} />
            <CollectionInteractiveSection collection={collection} />
        </main>
    );
}
