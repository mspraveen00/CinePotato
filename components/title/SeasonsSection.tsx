'use client';

import { useState, useEffect } from 'react';
import { Season, Episode, EpisodeGroupList } from '@/types/title';
import { Star, ChevronDown, ListVideo } from 'lucide-react';
import Link from 'next/link';

interface SeasonsSectionProps {
    titleId: string;
    seasons?: Season[];
    episodeGroups?: EpisodeGroupList[];
}

interface PillData {
    id: string;
    name: string;
    posterPath?: string | null;
    episodeCount?: number;
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
    const [activePills, setActivePills] = useState<PillData[]>([]);
    const [episodeCountToDisplay, setEpisodeCountToDisplay] = useState<number>(0);

    // Initial load: Set the broadcast season pills
    useEffect(() => {
        if (selectedGroupType === defaultGroupState && seasons.length > 0) {
            setActivePills(seasons.map(s => ({
                id: String(s.seasonNumber),
                name: s.name,
                posterPath: s.posterPath,
                episodeCount: s.episodeCount
            })));
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
                        setActivePills(groups.map((g: any) => ({
                            id: g.id,
                            name: g.name,
                            episodeCount: g.episodes ? g.episodes.length : undefined
                        })));

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

    const displayedEpisodes = episodes.slice(0, 10);

    // Calculate viewAllLink
    const viewAllLink = selectedGroupType === defaultGroupState
        ? `/tv/${titleId}/season/${selectedPillId}`
        : `/tv/${titleId}/group/${selectedGroupType}/${selectedPillId}`;

    return (
        <section className="mt-12 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <Link href={viewAllLink} className="group flex items-center gap-2 hover:text-amber-500 transition-colors w-fit">
                    <h3 className="text-xl sm:text-2xl font-bold">Seasons & Episodes</h3>
                    <ChevronDown className="w-5 h-5 -rotate-90 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>

                {/* Group Selector Dropdown */}
                {episodeGroups.length > 0 && (
                    <div className="flex items-center gap-2 text-sm shrink-0">
                        <span className="text-neutral-400 font-medium hidden sm:inline-block">Order By:</span>
                        <div className="relative">
                            <select
                                value={selectedGroupType}
                                onChange={(e) => setSelectedGroupType(e.target.value)}
                                className="appearance-none bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-white py-1.5 pl-3 pr-8 rounded-lg outline-none focus:border-amber-500/50 cursor-pointer font-medium transition-colors"
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

            <div className="space-y-4 pt-2">
                {/* Season/Group Selector Cards */}
                {activePills.length > 0 && (
                    <div
                        className="flex gap-4 overflow-x-auto pt-4 pb-4 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]"
                        style={{
                            maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                        }}
                    >
                        {activePills.map((pill) => {
                            const isSelected = selectedPillId === pill.id;
                            return (
                                <button
                                    key={pill.id}
                                    onClick={() => setSelectedPillId(pill.id)}
                                    className={`group flex-shrink-0 w-28 sm:w-36 flex flex-col gap-2.5 outline-none transition-all duration-300 ${isSelected ? '' : 'hover:-translate-y-1'}`}
                                >
                                    <div className={`w-full aspect-[2/3] rounded-xl overflow-hidden relative transition-all duration-300 ${isSelected
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] shadow-xl'
                                        : 'ring-1 ring-neutral-800 shadow-sm'
                                        }`}>
                                        {pill.posterPath ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w342${pill.posterPath}`}
                                                alt={pill.name}
                                                className={`w-full h-full object-cover transition-transform duration-700 ${isSelected ? '' : 'group-hover:scale-110'}`}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-800/80 flex items-center justify-center p-3 text-center border-b border-neutral-700">
                                                <span className="text-neutral-500 font-medium text-sm line-clamp-3">{pill.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between px-0.5 text-left w-full gap-2">
                                        <span className={`text-[13px] sm:text-sm font-semibold line-clamp-1 transition-colors ${isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                                            {pill.name}
                                        </span>
                                        {pill.episodeCount !== undefined && (
                                            <span className={`flex items-center gap-1 flex-shrink-0 text-[11px] sm:text-xs font-medium transition-colors ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                                <ListVideo className="w-3.5 h-3.5" />
                                                {pill.episodeCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Episodes List */}
                <div className="relative">
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
                        <div
                            className="flex gap-4 sm:gap-5 overflow-x-auto pt-4 pb-6 scrollbar-hide -mx-4 px-4 md:-mx-[calc((100vw-100%)/2)] md:px-[calc((100vw-100%)/2)]"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                            }}
                        >
                            {displayedEpisodes.map((ep) => (
                                <Link
                                    key={ep.id}
                                    href={`/tv/${titleId}/season/${ep.seasonNumber}/episode/${ep.episodeNumber}`}
                                    className="group relative flex-shrink-0 w-48 sm:w-[220px] flex flex-col gap-3"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-full aspect-video rounded-xl bg-neutral-800/50 overflow-hidden relative border border-neutral-800/60 shadow-sm transition-all duration-300 group-hover:border-neutral-600/80 group-hover:shadow-md">
                                        {ep.stillPath ? (
                                            <img
                                                src={ep.stillPath}
                                                alt={ep.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-col gap-1.5 px-1 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent">
                                        <h4 className="text-white font-medium text-sm sm:text-[15px] line-clamp-1 transition-colors group-hover:text-amber-500">
                                            {ep.episodeNumber}. {ep.name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[13px] text-neutral-400 font-medium">
                                            <span className="bg-neutral-800/80 px-1.5 py-0.5 rounded text-neutral-300 border border-neutral-700/50 shadow-sm">
                                                S{ep.seasonNumber} E{ep.episodeNumber}
                                            </span>
                                            {ep.runtime ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                                                    <span>{ep.runtime}m</span>
                                                </span>
                                            ) : null}
                                            {ep.rating > 0 && (
                                                <span className="flex items-center gap-1 text-amber-500/90 ml-auto">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    {ep.rating}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* View All Card */}
                            {!loading && !error && episodes.length > 10 && (
                                <Link
                                    href={viewAllLink}
                                    className="group flex-shrink-0 w-48 sm:w-[220px] flex flex-col gap-3"
                                >
                                    <div className="w-full aspect-video rounded-xl bg-neutral-900/40 border border-neutral-800/50 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-neutral-800/50 hover:border-neutral-700/80">
                                        <div className="w-12 h-12 rounded-full bg-neutral-800/80 border border-neutral-700/50 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:bg-neutral-700/80 group-hover:scale-110">
                                            <ChevronDown className="w-5 h-5 -rotate-90 text-neutral-300 transition-all group-hover:text-white group-hover:translate-x-0.5" />
                                        </div>
                                        <span className="font-medium text-sm text-neutral-400 transition-colors group-hover:text-white">View All {episodeCountToDisplay}</span>
                                    </div>
                                    {/* Invisible spacer to match the height of episode text */}
                                    <div className="flex flex-col gap-1 px-1 opacity-0 pointer-events-none">
                                        <h4 className="text-sm sm:text-[15px] line-clamp-1">Spacer</h4>
                                        <div className="text-[13px]">Spacer</div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
