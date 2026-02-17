"use client";

import React, { useState } from 'react';
import { useUserLists, MediaType, FilterState } from '@/lib/store/user-lists-store';
import { UserListLayout } from './UserListLayout';
import { WideCard } from './WideCard';
import { PosterCard } from './PosterCard';
import { ViewCycler } from './ViewCycler';
import { MediaSwitch } from './MediaSwitch';
import { FilterBar } from './FilterBar';
import { SortMenu } from './SortMenu';
import { Filter, GripHorizontal, Check, X as XIcon, MoreVertical, FolderInput, CopyPlus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface UserListPageContentProps {
    listId: string;
}

export function UserListPageContent({ listId }: UserListPageContentProps) {
    const { getList, setListViewMode, setListFilters, updateListOrder, lists, moveItem, copyItem } = useUserLists();
    const list = getList(listId);
    const [showFilters, setShowFilters] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (!list) return <div>List not found</div>;

    // Determine available media types for this list type
    const getAvailableMediaTypes = (): MediaType[] => {
        if (listId === 'ratings' || listId === 'bucketlist') {
            return ['movie', 'tv', 'episode', 'game'];
        }
        if (listId === 'favourites') {
            return ['movie', 'tv', 'episode', 'game', 'person'];
        }
        return ['movie', 'tv', 'episode', 'game', 'person'];
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            updateListOrder(listId, {
                activeId: Number(active.id),
                overId: Number(over.id)
            });
        }
    };

    const handleMoveTo = (itemId: number, targetListId: string) => {
        moveItem(itemId, listId, targetListId);
        setActionMenuOpen(null);
    };

    const handleCopyTo = (item: any, targetListId: string) => {
        copyItem(item, targetListId);
        setActionMenuOpen(null);
    };

    // Logic to determine if we show raw order (manual) or filtered/sorted
    const isManualSort = list.filters.sort === 'manual';
    const hasActiveFilters = list.filters.mediaTypes.length > 0 || list.filters.userRating.length > 0;

    // If reordering is active, we MUST show manual order and NO filters check should theoretically be enforced 
    // or we only allow reorder if no filters active. 
    // Requirement: "Applying sort temporarily overrides manual order. Clearing sort restores manual order."
    // So if sort is NOT manual, we show sorted items.

    let displayedItems = list.items;

    // 1. Filter
    if (hasActiveFilters) {
        displayedItems = displayedItems.filter(item => {
            const { mediaTypes, userRating } = list.filters;

            if (mediaTypes.length > 0 && !mediaTypes.includes(item.media_type)) return false;

            if (userRating.length > 0) {
                const itemRating = item.rating_user || 0;
                const matches = userRating.some(r => Math.floor(itemRating) === r);
                if (!matches) return false;
            }
            return true;
        });
    }

    // 2. Sort
    if (!isManualSort) {
        displayedItems = [...displayedItems].sort((a, b) => {
            const { sort, sortDirection } = list.filters;
            let comparison = 0;

            switch (sort) {
                case 'rating_imdb':
                    comparison = (a.rating_imdb || 0) - (b.rating_imdb || 0);
                    break;
                case 'rating_user':
                    comparison = (a.rating_user || 0) - (b.rating_user || 0);
                    break;
                case 'popularity':
                    comparison = (a.rating_popcornmeter || 0) - (b.rating_popcornmeter || 0);
                    break;
                default: comparison = 0;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    const gridClass = () => {
        switch (list.viewMode) {
            case 'wide': return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4';
            case 'poster-2': return 'grid-cols-2 gap-3';
            case 'poster-3': return 'grid-cols-3 gap-3';
            case 'poster-4': return 'grid-cols-2 md:grid-cols-4 gap-4';
            case 'poster-5': return 'grid-cols-2 md:grid-cols-5 gap-4';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        }
    };

    const showReorderToggle = listId === 'bucketlist' && !hasActiveFilters && isManualSort;

    return (
        <UserListLayout
            title={list.name}
        >
            {/* Controls */}
            <div className="flex flex-col gap-2 md:gap-4 mb-6">

                {/* 1. Media Switcher (Centered Tabs) */}
                <MediaSwitch
                    selectedTypes={list.filters.mediaTypes}
                    availableTypes={getAvailableMediaTypes()}
                    onChange={(types) => setListFilters(list.id, { mediaTypes: types })}
                />

                {/* 2. Action Bar: Filters (Left/Right?), Sort, View */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                    {/* Left: Reorder Toggle (if applicable) or empty space */}
                    <div>
                        {showReorderToggle && (
                            <button
                                onClick={() => setIsReordering(!isReordering)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isReordering ? 'bg-white text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
                            >
                                {isReordering ? <Check className="w-4 h-4" /> : <GripHorizontal className="w-4 h-4" />}
                                {isReordering ? "Done" : "Reorder"}
                            </button>
                        )}
                    </div>

                    {/* Right: Filter Toggle, Sort, View */}
                    <div className="flex items-center gap-3 ml-auto">
                        {!isReordering && (
                            <>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border border-neutral-800 ${showFilters ? 'bg-white text-black border-white' : 'bg-neutral-900 hover:bg-neutral-800 text-white'}`}
                                >
                                    <Filter className="w-4 h-4" />
                                    <span className="text-sm font-medium">Filters</span>
                                </button>

                                <SortMenu
                                    filters={list.filters}
                                    onChange={(f) => setListFilters(list.id, f)}
                                />
                            </>
                        )}

                        <div className="bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                            <ViewCycler
                                currentMode={list.viewMode}
                                onChange={(mode) => setListViewMode(list.id, mode)}
                            />
                        </div>
                    </div>
                </div>

                {showFilters && !isReordering && (
                    <FilterBar
                        filters={list.filters}
                        onChange={(f) => setListFilters(list.id, f)}
                    />
                )}
            </div>

            {/* Content */}
            {displayedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/50">
                    <p className="text-neutral-400">No items found.</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={displayedItems.map(i => i.id)}
                        strategy={list.viewMode === 'wide' ? verticalListSortingStrategy : rectSortingStrategy}
                    >
                        <div className={`grid ${gridClass()}`}>
                            {displayedItems.map(item => {
                                const ItemComponent = list.viewMode === 'wide' ? WideCard : PosterCard;

                                // Action Menu Content
                                const actions = (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === item.id ? null : item.id); }}
                                            className="p-1.5 rounded-full hover:bg-black/50 text-white/70 hover:text-white transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {actionMenuOpen === item.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden">
                                                <div className="p-1">
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase">Move to...</div>
                                                    {lists.filter(l => l.id !== listId && l.type !== 'system').map(l => (
                                                        <button
                                                            key={l.id}
                                                            onClick={() => handleMoveTo(item.id, l.id)}
                                                            className="flex items-center w-full px-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 rounded"
                                                        >
                                                            <FolderInput className="w-3.5 h-3.5 mr-2" />
                                                            {l.name}
                                                        </button>
                                                    ))}
                                                    <div className="my-1 border-t border-neutral-800" />
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase">Copy to...</div>
                                                    {lists.filter(l => l.id !== listId).map(l => (
                                                        <button
                                                            key={l.id}
                                                            onClick={() => handleCopyTo(item, l.id)}
                                                            className="flex items-center w-full px-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 rounded"
                                                        >
                                                            <CopyPlus className="w-3.5 h-3.5 mr-2" />
                                                            {l.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );

                                return (
                                    <SortableItem key={item.id} id={item.id} enabled={isReordering}>
                                        <div className={isReordering ? "pointer-events-none select-none" : ""}>
                                            {/* When reordering, clicking inside card shouldn't trigger nav */}
                                            <ItemComponent item={item} actions={actions} />
                                        </div>
                                    </SortableItem>
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Overlay to close menu when clicking outside */}
            {actionMenuOpen !== null && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActionMenuOpen(null)} />
            )}
        </UserListLayout>
    );
}
