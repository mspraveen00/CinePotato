import { getTVDetail, getSeasonDetail } from '@/lib/services/tv-service';
import { notFound } from 'next/navigation';
import SeasonPageClient from './season-page-client';

export const revalidate = 3600; // Cache for 1 hour

export default async function SeasonPage({
    params,
}: {
    params: Promise<{ id: string, seasonNumber: string }>
}) {
    const { id, seasonNumber } = await params;

    const titleDetail = await getTVDetail(id);
    if (!titleDetail) {
        notFound();
    }

    const seasonNum = parseInt(seasonNumber, 10);
    const episodes = await getSeasonDetail(id, seasonNum);

    // Sort seasons by seasonNumber to ensure correct ordering
    const sortedSeasons = titleDetail.seasons ? [...titleDetail.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber) : [];

    const currentSeason = sortedSeasons.find(s => s.seasonNumber === seasonNum);
    const currentIndex = sortedSeasons.findIndex(s => s.seasonNumber === seasonNum);

    const prevSeason = currentIndex > 0 ? sortedSeasons[currentIndex - 1] : null;
    const nextSeason = currentIndex !== -1 && currentIndex < sortedSeasons.length - 1 ? sortedSeasons[currentIndex + 1] : null;

    if (!episodes || episodes.length === 0) {
        notFound();
    }

    const seasonName = currentSeason?.name || `Season ${seasonNumber}`;
    const heroBackdrop = titleDetail.backdropImages?.[0];
    const posterUrl = currentSeason?.posterPath ? `https://image.tmdb.org/t/p/w500${currentSeason.posterPath}` : null;

    return (
        <SeasonPageClient
            id={id}
            titleDetail={titleDetail}
            episodes={episodes}
            seasonName={seasonName}
            heroBackdrop={heroBackdrop}
            posterUrl={posterUrl}
            prevSeason={prevSeason}
            nextSeason={nextSeason}
            currentSeason={currentSeason}
        />
    );
}
