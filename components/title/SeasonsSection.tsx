'use client';

import { useState, useEffect } from 'react';
import { Season, Episode, EpisodeGroupList } from '@/types/title';
import { Star, Calendar, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface SeasonsSectionProps {
    titleId: string;
    seasons?: Season[];
    episodeGroups?: EpisodeGroupList[];
}

export default function SeasonsSection({ titleId, seasons = [], episodeGroups = [] }: SeasonsSectionProps) {
    const defaultGroupState = "broadcast";
    const [selectedGroupType, setSelectedGroupType] = useState<string>(defaultGroupState);
    const [selectedPillId, setSelectedPillId] = useState<string>(
        seasons.length > 0 ? String(seasons[0].seasonNumber) : ""
    );

    // For storing the fetched episodes based on standard seasons or episode groups
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Derived variables for rendering pills
    const [activePills, setActivePills] = useState<Array<{ id: string, name: string }>>([]);
    const [episodeCountToDisplay, setEpisodeCountToDisplay] = useState<number>(0);

    // Initial load: Set the broadcast season pills
    useEffect(() => {
        if (selectedGroupType === defaultGroupState && seasons.length > 0) {
            setActivePills(seasons.map(s => ({ id: String(s.seasonNumber), name: s.name })));
            if (!activePills.find(p => p.id === selectedPillId)) {
                setSelectedPillId(String(seasons[0].seasonNumber));
            }
        }
    }, [selectedGroupType, seasons]);

    // Data Fetching logic
    useEffect(() => {
        let isMounted = true;

        async function fetchEpisodes() {
            setLoading(true);
            setError(null);
            try {
                if (selectedGroupType === defaultGroupState) {
                    // Fetch standard broadcast season
                    if (!selectedPillId) return;
                    const res = await fetch(`/api/tmdb/tv/${titleId}/season/${selectedPillId}`);
                    if (!res.ok) throw new Error('Failed to fetch season episodes');
                    const data = await res.json();

                    const mappedEpisodes: Episode[] = (data.episodes || []).map((ep: any) => ({
                        id: ep.id,
                        name: ep.name,
                        episodeNumber: ep.episode_number,
                        seasonNumber: ep.season_number,
                        overview: ep.overview,
                        airDate: ep.air_date,
                        runtime: ep.runtime,
                        stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
                        rating: parseFloat((ep.vote_average || 0).toFixed(1))
                    }));

                    if (isMounted) {
                        setEpisodes(mappedEpisodes);
                        setEpisodeCountToDisplay(mappedEpisodes.length);
                    }
                } else {
                    // Fetch episode group
                    const res = await fetch(`/api/tmdb/tv/episode_group/${selectedGroupType}`);
                    if (!res.ok) throw new Error('Failed to fetch episode group details');
                    const data = await res.json();

                    // The groups need to be parsed
                    const groups = data.groups || [];
                    if (isMounted) {
                        setActivePills(groups.map((g: any) => ({ id: g.id, name: g.name })));

                        // If current pill is not in this new group, select the first one
                        const currentPillGroup = groups.find((g: any) => g.id === selectedPillId);
                        const activeGroup = currentPillGroup || groups[0];

                        if (!currentPillGroup && groups.length > 0) {
                            setSelectedPillId(groups[0].id);
                        }

                        if (activeGroup) {
                            const mappedEpisodes: Episode[] = (activeGroup.episodes || []).map((ep: any) => ({
                                id: ep.id,
                                name: ep.name,
                                episodeNumber: ep.episode_number,
                                seasonNumber: ep.season_number,
                                overview: ep.overview,
                                airDate: ep.air_date,
                                runtime: ep.runtime,
                                stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
                                rating: parseFloat((ep.vote_average || 0).toFixed(1))
                            }));
                            setEpisodes(mappedEpisodes);
                            setEpisodeCountToDisplay(mappedEpisodes.length);
                        } else {
                            setEpisodes([]);
                            setEpisodeCountToDisplay(0);
                        }
                    }
                }
            } catch (err) {
                if (isMounted) setError('Failed to load episodes. Please try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (seasons.length > 0 || selectedGroupType !== defaultGroupState) {
            fetchEpisodes();
        } else {
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [titleId, selectedGroupType, selectedPillId, seasons.length]);

    if (seasons.length === 0 && episodeGroups.length === 0) return null;

    const displayedEpisodes = episodes.slice(0, 5);

    // Calculate viewAllLink
    const viewAllLink = selectedGroupType === defaultGroupState
        ? `/tv/${titleId}/season/${selectedPillId}`
        : `/tv/${titleId}/group/${selectedGroupType}/${selectedPillId}`;

    return (
        <section className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <h3 className="text-xl font-bold">Seasons & Episodes</h3>

                {/* Group Selector Dropdown */}
                {episodeGroups.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-neutral-400 font-medium">Order By:</span>
                        <div className="relative">
                            <select
                                value={selectedGroupType}
                                onChange={(e) => setSelectedGroupType(e.target.value)}
                                className="appearance-none bg-neutral-800/80 border border-neutral-700 text-white py-1.5 pl-3 pr-8 rounded-lg outline-none focus:border-amber-500/50 cursor-pointer font-medium"
                            >
                                {seasons.length > 0 && (
                                    <option value="broadcast">Broadcast Seasons</option>
                                )}
                                {episodeGroups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            {/* Season/Group Selector Pills */}
            {activePills.length > 0 && (
                <div
                    className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                    }}
                >
                    {activePills.map((pill) => (
                        <button
                            key={pill.id}
                            onClick={() => setSelectedPillId(pill.id)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${selectedPillId === pill.id
                                    ? 'bg-white text-black shadow-lg shadow-white/10'
                                    : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 backdrop-blur-sm border border-neutral-700/50'
                                }`}
                        >
                            {pill.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Episodes List */}
            <div className="space-y-4 pt-2">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-900/20 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                ) : episodes.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 bg-neutral-900/50 rounded-xl border border-neutral-800">
                        No episodes found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {displayedEpisodes.map((ep) => (
                            <div key={ep.id} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 bg-neutral-900/40 hover:bg-neutral-800/60 p-3 sm:p-4 rounded-xl border border-neutral-800/50 transition-colors duration-300">
                                {/* Thumbnail */}
                                <div className="w-full sm:w-64 flex-shrink-0 relative overflow-hidden rounded-lg aspect-video bg-neutral-800">
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
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md text-xs font-medium text-white shadow-sm border border-white/10">
                                        E{ep.episodeNumber}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                    <h4 className="text-base sm:text-lg font-bold text-white mb-2 leading-tight group-hover:text-amber-500 transition-colors">
                                        {ep.episodeNumber}. {ep.name}
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400 mb-3">
                                        {ep.rating > 0 && (
                                            <div className="flex items-center gap-1 font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                {ep.rating}
                                            </div>
                                        )}
                                        {ep.airDate && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(ep.airDate).getFullYear()}</span>
                                            </div>
                                        )}
                                        {ep.runtime && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{ep.runtime}m</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed max-w-3xl">
                                        {ep.overview || "No description available."}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* View All Button */}
                {!loading && !error && episodes.length > 5 && (
                    <div className="pt-2 pb-4">
                        <Link
                            href={viewAllLink}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 transition-all duration-300 group"
                        >
                            <span className="font-medium">View All {episodeCountToDisplay} Episodes</span>
                            <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
