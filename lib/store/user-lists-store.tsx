"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// --- Types ---

export type MediaType = 'movie' | 'tv' | 'episode' | 'game' | 'person';

export interface ListItem {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path?: string;
    media_type: MediaType;
    release_year?: number;
    runtime_or_episodes?: string; // e.g., "2h 28m" or "8 eps"
    content_rating?: string; // e.g., "PG-13", "TV-MA"

    // Ratings
    rating_imdb?: number;
    rating_metacritic?: number;
    rating_rotten_tomatoes?: number; // %
    rating_popcornmeter?: number; // %
    rating_tmdb?: number;
    rating_user?: number; // 0-10 or undefined

    genres?: string[];
    added_at: number; // Timestamp for sorting
}

export type ViewMode = 'wide' | 'wide-3' | 'poster-2' | 'poster-3' | 'poster-4' | 'poster-5' | 'poster-6' | 'poster-7';

export interface FilterState {
    sort: 'popularity' | 'rating_imdb' | 'rating_user' | 'manual';
    sortDirection: 'asc' | 'desc';
    mediaTypes: MediaType[];
    userRating: number[]; // Integers 1-10
    genres: string[];
    keywords: string[];
}

export interface UserList {
    id: string;
    name: string;
    type: 'system' | 'custom';
    items: ListItem[];
    description?: string;

    // Persisted per list
    viewMode: ViewMode;
    filters: FilterState;
}

interface UserListsContextType {
    lists: UserList[];
    isSyncing: boolean;
    syncWithCloud: () => Promise<void>;
    createList: (name: string) => void;
    renameList: (id: string, newName: string) => void;
    deleteList: (id: string) => void;
    getList: (id: string) => UserList | undefined;

    // Item Actions
    moveItem: (itemId: number, fromListId: string, toListId: string) => void;
    copyItem: (item: ListItem, toListId: string) => void;
    updateListOrder: (listId: string, info: { activeId: number; overId: number }) => void; // For drag and drop

    // View & Filter Actions
    setListViewMode: (listId: string, mode: ViewMode) => void;
    setListFilters: (listId: string, filters: Partial<FilterState>) => void;

    // Rating Actions
    getUserRating: (itemId: number | string) => number | undefined;
    setUserRating: (item: {
        id: number | string;
        title: string;
        poster_path?: string;
        backdrop_path?: string;
        media_type?: MediaType;
        release_year?: number;
        runtime_or_episodes?: string;
        content_rating?: string;
        rating_imdb?: number;
        rating_metacritic?: number;
        rating_rotten_tomatoes?: number;
        rating_popcornmeter?: number;
        rating_tmdb?: number;
        genres?: string[];
    }, rating: number) => void;
    removeUserRating: (itemId: number | string) => void;
}

// --- Mock Data ---

const MOCK_ITEMS: ListItem[] = [
    {
        id: 27205,
        title: "Inception",
        poster_path: "/e9D2FlSJq1h4u5EwtZv6ZlP5l1K.jpg",
        backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        media_type: "movie",
        release_year: 2010,
        runtime_or_episodes: "2h 28m",
        content_rating: "PG-13",
        rating_imdb: 8.8,
        rating_metacritic: 74,
        rating_rotten_tomatoes: 87,
        rating_popcornmeter: 91,
        rating_tmdb: 8.4,
        rating_user: 9,
        genres: ["Action", "Sci-Fi"],
        added_at: 1700000000000
    },
    {
        id: 157336,
        title: "Interstellar",
        poster_path: "/gEU2QniL6E8ahDaNBADBzOLDOkJ.jpg",
        backdrop_path: "/xJHokMBLkbke0umzh2O8C1dy5.jpg",
        media_type: "movie",
        release_year: 2014,
        runtime_or_episodes: "2h 49m",
        content_rating: "PG-13",
        rating_imdb: 8.7,
        rating_metacritic: 74,
        rating_rotten_tomatoes: 73,
        rating_popcornmeter: 86,
        rating_tmdb: 8.4,
        rating_user: 9,
        genres: ["Adventure", "Drama", "Sci-Fi"],
        added_at: 1700000000001
    },
    {
        id: 155,
        title: "The Dark Knight",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
        media_type: "movie",
        release_year: 2008,
        runtime_or_episodes: "2h 32m",
        content_rating: "PG-13",
        rating_imdb: 9.0,
        rating_metacritic: 84,
        rating_rotten_tomatoes: 94,
        rating_popcornmeter: 94,
        rating_tmdb: 8.5,
        rating_user: 10,
        genres: ["Action", "Crime", "Drama"],
        added_at: 1700000000002
    },
    {
        id: 1399,
        title: "Game of Thrones",
        poster_path: "/u3bZgnGQ9T01sWNhyhoK9iqHVII.jpg",
        backdrop_path: "/zZqpAXxVSBtxV9qPBcscfXBcL2w.jpg",
        media_type: "tv",
        release_year: 2011,
        runtime_or_episodes: "73 eps",
        content_rating: "TV-MA",
        rating_imdb: 9.2,
        rating_metacritic: 86,
        rating_rotten_tomatoes: 89,
        rating_popcornmeter: 91,
        rating_tmdb: 8.4,
        rating_user: 9,
        genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
        added_at: 1700000000003
    },
    {
        id: 66732,
        title: "Stranger Things",
        poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
        backdrop_path: "/56v2KjBlU4XaOv9rVYkOD82aLQ.jpg",
        media_type: "tv",
        release_year: 2016,
        runtime_or_episodes: "34 eps",
        content_rating: "TV-14",
        rating_imdb: 8.7,
        rating_metacritic: 74,
        rating_rotten_tomatoes: 92,
        rating_popcornmeter: 90,
        rating_tmdb: 8.6,
        rating_user: 8,
        genres: ["Sci-Fi & Fantasy", "Mystery", "Drama"],
        added_at: 1700000000004
    },
    {
        id: 693134,
        title: "Dune: Part Two",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        media_type: "movie",
        release_year: 2024,
        runtime_or_episodes: "2h 46m",
        content_rating: "PG-13",
        rating_imdb: 8.8,
        rating_metacritic: 79,
        rating_rotten_tomatoes: 93,
        rating_popcornmeter: 95,
        rating_tmdb: 8.3,
        rating_user: 10,
        genres: ["Science Fiction", "Adventure"],
        added_at: 1700000000005
    }
];

const DEFAULT_FILTERS: FilterState = {
    sort: 'manual', // Default for bucketlist, others might override logic in component
    sortDirection: 'desc',
    mediaTypes: [],
    userRating: [],
    genres: [],
    keywords: []
};

const INITIAL_LISTS: UserList[] = [
    {
        id: "ratings",
        name: "Ratings",
        type: "system",
        items: [MOCK_ITEMS[0], MOCK_ITEMS[2], MOCK_ITEMS[3]],
        description: "Your rated movies and TV shows",
        viewMode: 'wide',
        filters: { ...DEFAULT_FILTERS, sort: 'rating_user' }
    },
    {
        id: "favourites",
        name: "Favourites",
        type: "system",
        items: [MOCK_ITEMS[1], MOCK_ITEMS[4], MOCK_ITEMS[5]], // Interstellar, Stranger Things, Dune Part Two
        description: "Your favourite content",
        viewMode: 'wide',
        filters: { ...DEFAULT_FILTERS }
    },
    {
        id: "bucketlist",
        name: "BucketList",
        type: "system",
        items: [MOCK_ITEMS[2], MOCK_ITEMS[0]], // Dark Knight, Inception
        description: "Content you want to watch",
        viewMode: 'wide',
        filters: { ...DEFAULT_FILTERS, sort: 'manual' }
    }
];

const UserListsContext = createContext<UserListsContextType | undefined>(undefined);

export function UserListsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [lists, setLists] = useState<UserList[]>(INITIAL_LISTS);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const isInitialCloudFetchDone = useRef(false);

    const supabase = createClient();

    // 1. Load from localStorage initially
    useEffect(() => {
        const saved = localStorage.getItem('userLists');
        if (saved) {
            try {
                setLists(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load lists from localStorage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // 2. Fetch from Supabase when user logs in
    useEffect(() => {
        if (!user) {
            isInitialCloudFetchDone.current = false;
            return;
        }

        const fetchUserListsFromSupabase = async () => {
            setIsSyncing(true);
            try {
                const { data, error } = await supabase
                    .from('user_lists')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    console.warn("Supabase user_lists table query:", error.message);
                } else if (data && data.length > 0) {
                    // Map database records into UserList shape
                    const cloudLists: UserList[] = data.map((row: any) => ({
                        id: row.id,
                        name: row.name,
                        type: row.type || 'custom',
                        description: row.description || '',
                        viewMode: row.view_mode || 'wide',
                        filters: row.filters || DEFAULT_FILTERS,
                        items: Array.isArray(row.items) ? row.items : []
                    }));

                    // Ensure all system lists exist even if user doesn't have them yet
                    const systemListIds = ['ratings', 'favourites', 'bucketlist'];
                    const mergedLists = [...cloudLists];
                    for (const sysId of systemListIds) {
                        if (!mergedLists.some(l => l.id === sysId)) {
                            const defaultSysList = INITIAL_LISTS.find(l => l.id === sysId);
                            if (defaultSysList) {
                                mergedLists.push({ ...defaultSysList, items: [] });
                            }
                        }
                    }

                    setLists(mergedLists);
                } else {
                    // First time login with no cloud lists yet: upload current local lists
                    await uploadListsToCloud(lists, user.id);
                }
            } catch (err) {
                console.error("Error fetching lists from Supabase:", err);
            } finally {
                setIsSyncing(false);
                isInitialCloudFetchDone.current = true;
            }
        };

        fetchUserListsFromSupabase();
    }, [user?.id]);

    // Helper: Upload lists to Supabase
    const uploadListsToCloud = async (listsToUpload: UserList[], userId: string) => {
        try {
            const rows = listsToUpload.map(list => ({
                id: list.id,
                user_id: userId,
                name: list.name,
                type: list.type,
                description: list.description || '',
                view_mode: list.viewMode || 'wide',
                filters: list.filters || DEFAULT_FILTERS,
                items: list.items || [],
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('user_lists')
                .upsert(rows, { onConflict: 'user_id,id' });

            if (error) {
                console.warn("Could not save to Supabase user_lists:", error.message);
            }
        } catch (err) {
            console.error("Cloud save failed:", err);
        }
    };

    // 3. Save to localStorage & Cloud whenever lists change
    useEffect(() => {
        if (!isLoaded) return;

        localStorage.setItem('userLists', JSON.stringify(lists));

        if (user && isInitialCloudFetchDone.current) {
            const timeout = setTimeout(() => {
                uploadListsToCloud(lists, user.id);
            }, 800); // Debounce cloud sync
            return () => clearTimeout(timeout);
        }
    }, [lists, isLoaded, user?.id]);

    const syncWithCloud = async () => {
        if (!user) return;
        setIsSyncing(true);
        await uploadListsToCloud(lists, user.id);
        setIsSyncing(false);
    };

    const createList = (name: string) => {
        const newList: UserList = {
            id: `custom-${Date.now()}`,
            name,
            type: 'custom',
            items: [],
            description: "Custom user list",
            viewMode: 'wide',
            filters: { ...DEFAULT_FILTERS }
        };
        setLists(prev => [...prev, newList]);
    };

    const renameList = (id: string, newName: string) => {
        setLists(prev => prev.map(list => {
            if (list.id === id && list.type === 'custom') {
                return { ...list, name: newName };
            }
            return list;
        }));
    };

    const deleteList = (id: string) => {
        setLists(prev => prev.filter(list => {
            if (list.type === 'system') return false;
            return list.id !== id;
        }));
    };

    const getList = (id: string) => {
        return lists.find(l => l.id === id);
    };

    const setListViewMode = (listId: string, mode: ViewMode) => {
        setLists(prev => prev.map(list => {
            if (list.id === listId) {
                return { ...list, viewMode: mode };
            }
            return list;
        }));
    };

    const setListFilters = (listId: string, filters: Partial<FilterState>) => {
        setLists(prev => prev.map(list => {
            if (list.id === listId) {
                return { ...list, filters: { ...list.filters, ...filters } };
            }
            return list;
        }));
    };

    const moveItem = (itemId: number, fromListId: string, toListId: string) => {
        setLists(prev => {
            const sourceList = prev.find(l => l.id === fromListId);
            const targetList = prev.find(l => l.id === toListId);
            if (!sourceList || !targetList) return prev;

            const item = sourceList.items.find(i => i.id === itemId);
            if (!item) return prev;

            // Remove from source
            const newSourceItems = sourceList.items.filter(i => i.id !== itemId);

            // Add to target (check duplicates)
            const existsInTarget = targetList.items.some(i => i.id === itemId);
            const newTargetItems = existsInTarget ? targetList.items : [...targetList.items, item];

            return prev.map(list => {
                if (list.id === fromListId) return { ...list, items: newSourceItems };
                if (list.id === toListId) return { ...list, items: newTargetItems };
                return list;
            });
        });
    };

    const copyItem = (item: ListItem, toListId: string) => {
        setLists(prev => prev.map(list => {
            if (list.id === toListId) {
                const exists = list.items.some(i => i.id === item.id);
                if (exists) return list;
                return { ...list, items: [...list.items, item] };
            }
            return list;
        }));
    };

    const updateListOrder = (listId: string, info: { activeId: number; overId: number }) => {
        setLists(prev => prev.map(list => {
            if (list.id !== listId) return list;

            const oldIndex = list.items.findIndex(i => i.id === info.activeId);
            const newIndex = list.items.findIndex(i => i.id === info.overId);

            if (oldIndex === -1 || newIndex === -1) return list;

            const newItems = [...list.items];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            return { ...list, items: newItems };
        }));
    };

    const getUserRating = (itemId: number | string): number | undefined => {
        const numId = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId;
        const ratingsList = lists.find(l => l.id === 'ratings');
        const ratedItem = ratingsList?.items.find(i => i.id === numId || String(i.id) === String(itemId));
        if (ratedItem && ratedItem.rating_user !== undefined) {
            return ratedItem.rating_user;
        }
        for (const list of lists) {
            const found = list.items.find(i => i.id === numId || String(i.id) === String(itemId));
            if (found && found.rating_user !== undefined) {
                return found.rating_user;
            }
        }
        return undefined;
    };

    const setUserRating = (
        itemData: {
            id: number | string;
            title: string;
            poster_path?: string;
            backdrop_path?: string;
            media_type?: MediaType;
            release_year?: number;
            runtime_or_episodes?: string;
            content_rating?: string;
            rating_imdb?: number;
            rating_metacritic?: number;
            rating_rotten_tomatoes?: number;
            rating_popcornmeter?: number;
            rating_tmdb?: number;
            genres?: string[];
        },
        rating: number
    ) => {
        const numId = typeof itemData.id === 'string' ? parseInt(itemData.id, 10) : itemData.id;
        const cleanRating = Math.round(rating * 10) / 10;

        setLists(prev => {
            return prev.map(list => {
                if (list.id === 'ratings') {
                    const existingIndex = list.items.findIndex(i => i.id === numId || String(i.id) === String(itemData.id));
                    if (existingIndex !== -1) {
                        const updatedItems = [...list.items];
                        updatedItems[existingIndex] = {
                            ...updatedItems[existingIndex],
                            rating_user: cleanRating,
                            poster_path: itemData.poster_path || updatedItems[existingIndex].poster_path,
                            backdrop_path: itemData.backdrop_path || updatedItems[existingIndex].backdrop_path,
                            added_at: Date.now()
                        };
                        return { ...list, items: updatedItems };
                    } else {
                        const newItem: ListItem = {
                            id: numId,
                            title: itemData.title,
                            poster_path: itemData.poster_path || '',
                            backdrop_path: itemData.backdrop_path,
                            media_type: itemData.media_type || 'movie',
                            release_year: itemData.release_year,
                            runtime_or_episodes: itemData.runtime_or_episodes,
                            content_rating: itemData.content_rating,
                            rating_imdb: itemData.rating_imdb,
                            rating_metacritic: itemData.rating_metacritic,
                            rating_rotten_tomatoes: itemData.rating_rotten_tomatoes,
                            rating_popcornmeter: itemData.rating_popcornmeter,
                            rating_tmdb: itemData.rating_tmdb,
                            rating_user: cleanRating,
                            genres: itemData.genres,
                            added_at: Date.now()
                        };
                        return { ...list, items: [newItem, ...list.items] };
                    }
                } else {
                    const hasItem = list.items.some(i => i.id === numId || String(i.id) === String(itemData.id));
                    if (!hasItem) return list;
                    return {
                        ...list,
                        items: list.items.map(i =>
                            (i.id === numId || String(i.id) === String(itemData.id))
                                ? { ...i, rating_user: cleanRating }
                                : i
                        )
                    };
                }
            });
        });
    };

    const removeUserRating = (itemId: number | string) => {
        const numId = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId;
        setLists(prev => {
            return prev.map(list => {
                if (list.id === 'ratings') {
                    return {
                        ...list,
                        items: list.items.filter(i => i.id !== numId && String(i.id) !== String(itemId))
                    };
                } else {
                    return {
                        ...list,
                        items: list.items.map(i =>
                            (i.id === numId || String(i.id) === String(itemId))
                                ? { ...i, rating_user: undefined }
                                : i
                        )
                    };
                }
            });
        });
    };

    if (!isLoaded) {
        return null; // Or a loading spinner preventing hydration mismatch
    }

    return (
        <UserListsContext.Provider value={{
            lists,
            isSyncing,
            syncWithCloud,
            createList,
            renameList,
            deleteList,
            getList,
            setListViewMode,
            setListFilters,
            moveItem,
            copyItem,
            updateListOrder,
            getUserRating,
            setUserRating,
            removeUserRating
        }}>
            {children}
        </UserListsContext.Provider>
    );
}

export function useUserLists() {
    const context = useContext(UserListsContext);
    if (context === undefined) {
        throw new Error('useUserLists must be used within a UserListsProvider');
    }
    return context;
}
