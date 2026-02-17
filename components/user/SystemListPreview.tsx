"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { UserList } from '@/lib/store/user-lists-store';

interface SystemListPreviewProps {
    list: UserList;
}

export function SystemListPreview({ list }: SystemListPreviewProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{list.name}</h2>
                <Link
                    href={`/user/${list.id}`}
                    className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                    View all <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                {list.items.length === 0 ? (
                    <div className="w-full h-40 bg-neutral-900 rounded-lg flex items-center justify-center border border-dashed border-neutral-800">
                        <p className="text-neutral-500">List is empty</p>
                    </div>
                ) : (
                    list.items.map(item => (
                        <div key={item.id} className="min-w-[140px] w-[140px] group relative">
                            <div className="aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden relative">
                                {item.poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-500 text-xs text-center p-2">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <p className="mt-2 text-sm font-medium text-white truncate">{item.title}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
