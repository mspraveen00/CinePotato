"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { UserList } from '@/lib/store/user-lists-store';
import { cn } from '@/lib/utils';
import { getResizedImage } from '@/lib/image-utils';

interface SystemListPreviewProps {
    list: UserList;
}

export function SystemListPreview({ list }: SystemListPreviewProps) {
    return (
        <div className="flex flex-col gap-4">
            <Link
                href={`/user/${list.id}`}
                className="flex items-center justify-between px-4 md:px-8 group"
            >
                <h2 className="flex items-center gap-2 text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    <span>{list.name}</span>
                    <ChevronRight className="text-neutral-500 group-hover:text-blue-400 transition-colors" size={20} />
                </h2>
            </Link>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-pl-4 md:scroll-pl-8 scrollbar-hide">
                {list.items.length === 0 ? (
                    <div className="w-full h-40 bg-neutral-900 rounded-lg flex items-center justify-center border border-dashed border-neutral-800 mx-4 md:mx-8">
                        <p className="text-neutral-500">List is empty</p>
                    </div>
                ) : (
                    <>
                        {list.items.map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "snap-start w-[140px] md:w-[160px] flex-shrink-0 group relative",
                                    index === 0 && "ml-4 md:ml-8"
                                )}
                            >
                                <div className="aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden relative border border-neutral-800 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                                    {item.poster_path ? (
                                        <img
                                            src={getResizedImage(`https://image.tmdb.org/t/p/original${item.poster_path}`, "thumbnail")}
                                            alt={item.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-500 text-xs text-center p-2">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{item.title}</p>
                            </div>
                        ))}

                        {/* See All Card */}
                        <Link
                            href={`/user/${list.id}`}
                            className="snap-start flex flex-col gap-2 w-[140px] md:w-[160px] flex-shrink-0 mr-4 md:mr-8 cursor-pointer group/see-all"
                        >
                            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center group-hover/see-all:bg-white/5 transition-colors">
                                <div className="flex flex-col items-center gap-2 text-neutral-400 group-hover/see-all:text-blue-400 transition-colors">
                                    <span className="font-medium">See All</span>
                                    <div className="h-8 w-8 rounded-full border border-current flex items-center justify-center">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-transparent">Placeholder</span>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
