import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEpisodeDetail } from '@/lib/services/tv-service';
import EpisodePageClient from './episode-page-client';

export const revalidate = 3600; // Cache for 1 hour

interface PageProps {
    params: Promise<{
        id: string;
        seasonNumber: string;
        episodeNumber: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, seasonNumber, episodeNumber } = await params;
    const seasonNum = parseInt(seasonNumber, 10);
    const episodeNum = parseInt(episodeNumber, 10);

    if (isNaN(seasonNum) || isNaN(episodeNum)) {
        return {
            title: 'Episode Not Found | CinePotato'
        };
    }

    const episodeDetail = await getEpisodeDetail(id, seasonNum, episodeNum);

    if (!episodeDetail) {
        return {
            title: 'Episode Not Found | CinePotato'
        };
    }

    const title = `${episodeDetail.title} - ${episodeDetail.seriesTitle} (S${seasonNumber}E${episodeNumber}) | CinePotato`;
    const description = episodeDetail.overview || `Watch details, cast, and ratings for ${episodeDetail.title} on CinePotato.`;
    const image = episodeDetail.stillPath || episodeDetail.posterPath;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: image ? [{ url: image }] : [],
            type: 'video.episode'
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [image] : []
        }
    };
}

export default async function EpisodePage({ params }: PageProps) {
    const { id, seasonNumber, episodeNumber } = await params;
    const seasonNum = parseInt(seasonNumber, 10);
    const episodeNum = parseInt(episodeNumber, 10);

    if (isNaN(seasonNum) || isNaN(episodeNum)) {
        notFound();
    }

    const episodeDetail = await getEpisodeDetail(id, seasonNum, episodeNum);

    if (!episodeDetail) {
        notFound();
    }

    return <EpisodePageClient episodeDetail={episodeDetail} />;
}
