'use client';

import React, { useState } from 'react';
import { TitleDetail } from '@/types/title';
import { getResizedImage } from '@/lib/image-utils';
import { Camera, MapPin, Calendar, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { TMDBLogo, IMDbIcon } from '@/components/user/RatingIcons';
import KnownForSection from '@/components/person/KnownForSection';
import Person3DGalleryModal from './Person3DGalleryModal';

interface PersonProfileHeaderProps {
    person: TitleDetail;
}

function calculateAgeAndDates(birthday?: string, deathday?: string | null) {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) return null;

    const formattedBirth = birthDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    let formattedDeath: string | null = null;
    let age = 0;

    if (deathday) {
        const deathDate = new Date(deathday);
        if (!isNaN(deathDate.getTime())) {
            formattedDeath = deathDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
            age = deathDate.getFullYear() - birthDate.getFullYear();
            const monthDiff = deathDate.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && deathDate.getDate() < birthDate.getDate())) {
                age--;
            }
        }
    } else {
        const now = new Date();
        age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
            age--;
        }
    }

    return {
        formattedBirth,
        formattedDeath,
        age,
        isDeceased: !!deathday,
    };
}

export default function PersonProfileHeader({ person }: PersonProfileHeaderProps) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    const images = person.profileImages || (person.posterPath ? [person.posterPath] : []);
    const photoCount = images.length;
    const dateInfo = calculateAgeAndDates(person.birthday, person.deathday);
    const department = person.knownForDepartment || person.genres?.[0] || 'Acting';

    const biography = person.overview || 'No biography available.';
    const isLongBio = biography.length > 550;
    const displayBio = !isLongBio || isBioExpanded
        ? biography
        : biography.slice(0, 520) + '...';

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                {/* Left Column: Portrait Photo & Personal Info */}
                <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 space-y-6">
                    {/* Portrait Photo Card */}
                    <div
                        onClick={() => photoCount > 0 && setIsGalleryOpen(true)}
                        className={`group relative w-48 sm:w-56 md:w-full mx-auto aspect-[2/3] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl shadow-black/80 ${
                            photoCount > 0 ? 'cursor-pointer hover:border-neutral-600 transition-all duration-300' : ''
                        }`}
                    >
                        {person.posterPath ? (
                            <img
                                src={getResizedImage(person.posterPath, 'poster')}
                                alt={person.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="eager"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                                No Photo Available
                            </div>
                        )}

                        {/* Hover Overlay */}
                        {photoCount > 0 && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold shadow-xl scale-95 group-hover:scale-100 transition-transform">
                                    <Camera size={14} />
                                    <span>View 3D Gallery</span>
                                </div>
                            </div>
                        )}

                        {/* Floating Photo Counter Badge */}
                        {photoCount > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-700/60 text-white text-xs flex items-center gap-1.5 shadow-lg pointer-events-none">
                                <Camera size={12} className="text-neutral-400" />
                                <span className="font-medium">{photoCount} Photos</span>
                            </div>
                        )}
                    </div>

                    {/* Personal Info Box */}
                    <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 space-y-4 text-sm">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800/80 pb-2">
                            Personal Info
                        </h2>

                        {/* Known For Department */}
                        <div>
                            <span className="block text-xs font-medium text-neutral-500 mb-0.5">Known For</span>
                            <span className="text-white font-medium">{department}</span>
                        </div>

                        {/* Gender */}
                        {person.gender && (
                            <div>
                                <span className="block text-xs font-medium text-neutral-500 mb-0.5">Gender</span>
                                <span className="text-white font-medium">{person.gender}</span>
                            </div>
                        )}

                        {/* Birthday & Age */}
                        {dateInfo && (
                            <div>
                                <span className="block text-xs font-medium text-neutral-500 mb-0.5">
                                    {dateInfo.isDeceased ? 'Born' : 'Birthday & Age'}
                                </span>
                                <div className="text-white font-medium flex items-center gap-1.5">
                                    <Calendar size={14} className="text-neutral-500 flex-shrink-0" />
                                    <span>
                                        {dateInfo.formattedBirth} {!dateInfo.isDeceased && `(${dateInfo.age} years old)`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Day of Death (if deceased) */}
                        {dateInfo?.isDeceased && dateInfo.formattedDeath && (
                            <div>
                                <span className="block text-xs font-medium text-neutral-500 mb-0.5">Died</span>
                                <span className="text-white font-medium">
                                    {dateInfo.formattedDeath} (at age {dateInfo.age})
                                </span>
                            </div>
                        )}

                        {/* Place of Birth */}
                        {person.placeOfBirth && (
                            <div>
                                <span className="block text-xs font-medium text-neutral-500 mb-0.5">Place of Birth</span>
                                <div className="text-white font-medium flex items-start gap-1.5">
                                    <MapPin size={14} className="text-neutral-500 flex-shrink-0 mt-0.5" />
                                    <span className="leading-snug">{person.placeOfBirth}</span>
                                </div>
                            </div>
                        )}

                        {/* External Links */}
                        <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                            <span className="block text-xs font-medium text-neutral-500">Official Profiles</span>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {/* TMDB */}
                                <a
                                    href={`https://www.themoviedb.org/person/${person.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-medium text-neutral-300 hover:text-white transition-all shadow-sm"
                                    title="View on TMDB"
                                >
                                    <TMDBLogo className="w-3.5 h-3.5" />
                                    <span>TMDB</span>
                                    <ExternalLink size={11} className="text-neutral-500" />
                                </a>

                                {/* IMDb */}
                                {person.imdbId && (
                                    <a
                                        href={`https://www.imdb.com/name/${person.imdbId}/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-medium text-neutral-300 hover:text-white transition-all shadow-sm"
                                        title="View on IMDb"
                                    >
                                        <IMDbIcon className="w-6 h-3" />
                                        <span>IMDb</span>
                                        <ExternalLink size={11} className="text-neutral-500" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Column: Name, Biography, and Known For Section */}
                <main className="flex-1 min-w-0 space-y-8">
                    {/* Header: Name and Department Badge */}
                    <div className="space-y-3">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                            {person.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-neutral-800/80 text-neutral-300 border border-neutral-700/60 rounded-full">
                                {department}
                            </span>
                            {dateInfo && !dateInfo.isDeceased && (
                                <span className="text-neutral-400 text-sm font-medium">
                                    • {dateInfo.age} years old
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Biography Section */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">Biography</h2>
                        <div className="relative">
                            <p className="text-neutral-300 leading-relaxed text-base md:text-lg whitespace-pre-line">
                                {displayBio}
                            </p>
                            {isLongBio && (
                                <button
                                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                                >
                                    <span>{isBioExpanded ? 'Read less' : 'Read full biography'}</span>
                                    {isBioExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Known For Section (Untouched) */}
                    {person.knownFor && person.knownFor.length > 0 && (
                        <div className="pt-2">
                            <KnownForSection credits={person.knownFor} />
                        </div>
                    )}
                </main>
            </div>

            {/* 3D Cover Flow Gallery Modal */}
            <Person3DGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={images}
                name={person.title}
            />
        </div>
    );
}
