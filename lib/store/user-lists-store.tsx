"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
        items: [MOCK_ITEMS[1], MOCK_ITEMS[4]],
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
    const [lists, setLists] = useState<UserList[]>(INITIAL_LISTS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Persistence Load
    useEffect(() => {
        const saved = localStorage.getItem('userLists');
        if (saved) {
            try {
                setLists(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load lists", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Persistence Save
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('userLists', JSON.stringify(lists));
        }
    }, [lists, isLoaded]);

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

    if (!isLoaded) {
        return null; // Or a loading spinner preventing hydration mismatch
    }

    return (
        <UserListsContext.Provider value={{
            lists,
            createList,
            renameList,
            deleteList,
            getList,
            setListViewMode,
            setListFilters,
            moveItem,
            copyItem,
            updateListOrder
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
