export type ShelfType = 'movies' | 'tv' | 'games';

export interface ShelfConfig {
    id: string;
    title: string;
}

export const MOVIE_SHELVES: ShelfConfig[] = [
    { id: 'trending_movies', title: 'Trending Movies' },
    { id: 'anticipated_movies', title: 'Anticipated Movies' },
    { id: 'imdb_top_250_movies', title: 'IMDb Top 250 Movies' },
    { id: 'box_office', title: 'All-Time Worldwide Box Office' },
    { id: 'best_picture', title: 'Academy Award for Best Picture Winners' },
];

export const TV_SHELVES: ShelfConfig[] = [
    { id: 'trending_tv', title: 'Trending TV Series' },
    { id: 'anticipated_tv', title: 'Anticipated TV Series' },
    { id: 'imdb_top_250_tv', title: 'IMDb Top 250 TV Series' },
    { id: 'emmy_winners', title: 'Emmy Award–Winning Series' },
];

export const GAME_SHELVES: ShelfConfig[] = [
    { id: 'trending_games', title: 'Trending Games' },
    { id: 'anticipated_games', title: 'Most Anticipated Games' },
    { id: 'top_rated_games', title: 'Top Rated Games (All Time)' },
    { id: 'best_selling_games', title: 'Best-Selling Games of All Time' },
    { id: 'award_winning_games', title: 'Award-Winning Games' },
];

export interface MockItem {
    id: string;
    title: string;
    posterUrl: string; // Placeholder color or simple text for now
    rating: number;
    year: number;
}
