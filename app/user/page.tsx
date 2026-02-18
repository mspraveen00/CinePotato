"use client";

import React from 'react';
import { useUserLists } from '@/lib/store/user-lists-store';
import { SystemListPreview } from '@/components/user/SystemListPreview';
import { CreateListButton } from '@/components/user/CreateListButton';
import { Trash2, Edit2, Folder } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserPage() {
    const { lists, createList, deleteList, renameList } = useUserLists();
    const router = useRouter();

    const systemLists = lists.filter(list => list.type === 'system');
    const customLists = lists.filter(list => list.type === 'custom');

    const handleCreateList = () => {
        const name = window.prompt("Enter list name:");
        if (name) {
            createList(name);
        }
    };

    const handleDeleteList = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to delete this list?")) {
            deleteList(id);
        }
    };

    const handleRenameList = (id: string, currentName: string, e: React.MouseEvent) => {
        e.preventDefault();
        const newName = window.prompt("Enter new list name:", currentName);
        if (newName) {
            renameList(id, newName);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 space-y-12 pt-8">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-8">
                <h1 className="text-3xl font-bold">My Library</h1>
                <CreateListButton onClick={handleCreateList} />
            </div>

            {/* System Lists */}
            <div className="space-y-12">
                {systemLists.map(list => (
                    <SystemListPreview key={list.id} list={list} />
                ))}
            </div>

            {/* Custom Lists Section */}
            <div className="space-y-6 pt-8 border-t border-neutral-800 px-4 md:px-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">My Collections</h2>
                    <span className="text-neutral-500 text-sm">{customLists.length} lists</span>
                </div>

                {customLists.length === 0 ? (
                    <div className="bg-neutral-900/50 border border-dashed border-neutral-800 rounded-xl p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <Folder className="w-12 h-12 text-neutral-600" />
                        </div>
                        <p className="text-neutral-400 mb-4">You haven't created any custom lists yet.</p>
                        <CreateListButton onClick={handleCreateList} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {customLists.map(list => (
                            <Link
                                href={`/user/${list.id}`}
                                key={list.id}
                                className="group block bg-neutral-900 rounded-xl p-6 hover:bg-neutral-800 transition-colors border border-neutral-800 hover:border-neutral-700 relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{list.name}</h3>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleRenameList(list.id, list.name, e)}
                                            className="p-1.5 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white"
                                            title="Rename list"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteList(list.id, e)}
                                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-400 hover:text-red-500"
                                            title="Delete list"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-neutral-500">
                                    <span>{list.items.length} items</span>
                                    <span className="text-xs">
                                        Modified {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
