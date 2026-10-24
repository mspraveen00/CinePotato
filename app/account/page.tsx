'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLists } from '@/lib/store/user-lists-store';
import { User, LogIn, LogOut, Cloud, CloudCheck, Star, Bookmark, FolderHeart, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
    const { user, profile, signOut, openAuthModal, isLoading } = useAuth();
    const { lists, isSyncing, syncWithCloud } = useUserLists();

    const ratingsCount = lists.find(l => l.id === 'ratings')?.items.length || 0;
    const favouritesCount = lists.find(l => l.id === 'favourites')?.items.length || 0;
    const bucketlistCount = lists.find(l => l.id === 'bucketlist')?.items.length || 0;
    const customListsCount = lists.filter(l => l.type === 'custom').length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white px-4 md:px-12 py-10 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent">
                    Account & Profile
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                    Manage your credentials, synced movie library, and cloud backups.
                </p>
            </div>

            {/* Profile Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 md:p-8 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-xl">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Avatar"
                                    className="h-full w-full rounded-2xl object-cover"
                                />
                            ) : (
                                <User size={36} />
                            )}
                            {user && (
                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 border-black" />
                            )}
                        </div>

                        <div>
                            {user ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-white">
                                            {profile?.username || user.user_metadata?.user_name || user.email?.split('@')[0]}
                                        </h2>
                                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                                            Cloud Synced
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-400 mt-0.5">{user.email}</p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Member since {new Date(user.created_at || '').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-white">Guest User</h2>
                                    <p className="text-sm text-neutral-400 mt-0.5">
                                        Your library is stored in browser cache only.
                                    </p>
                                    <p className="text-xs text-amber-400/90 mt-1 flex items-center gap-1.5">
                                        <ShieldCheck size={14} /> Sign in to securely preserve your data forever.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        {user ? (
                            <button
                                onClick={signOut}
                                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 active:scale-95"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        ) : (
                            <button
                                onClick={openAuthModal}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
                            >
                                <LogIn size={16} />
                                Sign In / Register
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sync & Library Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link
                    href="/user/ratings"
                    className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4 transition hover:border-amber-500/30 hover:bg-neutral-900/80 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Ratings</span>
                        <Star size={16} className="text-amber-400 group-hover:scale-110 transition" />
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{ratingsCount}</p>
                </Link>

                <Link
                    href="/user/favourites"
                    className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4 transition hover:border-rose-500/30 hover:bg-neutral-900/80 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Favourites</span>
                        <FolderHeart size={16} className="text-rose-400 group-hover:scale-110 transition" />
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{favouritesCount}</p>
                </Link>

                <Link
                    href="/user/bucketlist"
                    className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4 transition hover:border-blue-500/30 hover:bg-neutral-900/80 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">BucketList</span>
                        <Bookmark size={16} className="text-blue-400 group-hover:scale-110 transition" />
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{bucketlistCount}</p>
                </Link>

                <Link
                    href="/user"
                    className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4 transition hover:border-purple-500/30 hover:bg-neutral-900/80 group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Custom Lists</span>
                        <span className="text-xs font-bold text-purple-400">All</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{customListsCount}</p>
                </Link>
            </div>

            {/* Cloud Status / Sync Tool */}
            {user && (
                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Cloud size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Supabase Cloud Sync</h3>
                            <p className="text-xs text-neutral-400">
                                Your lists and ratings automatically sync to your Supabase PostgreSQL database.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={syncWithCloud}
                        disabled={isSyncing}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
                    >
                        {isSyncing ? (
                            <>
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <Cloud size={14} />
                                Force Sync Now
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
