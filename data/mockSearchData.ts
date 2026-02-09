import { SearchResult } from '@/types/search';

export const mockSearchResults: SearchResult[] = [
    // Movies
    {
        id: 'm1',
        title: 'The Dark Knight',
        mediaType: 'movie',
        rating: 9.0,
        voteCount: 2800000,
        releaseDate: '2008-07-18',
        popularity: 100,
        overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
        awards: ['oscar', 'bafta_film'],
        awardCategories: ['best_supporting_actor', 'best_sound_editing'],
    },
    {
        id: 'm2',
        title: 'Inception',
        mediaType: 'movie',
        rating: 8.8,
        voteCount: 2500000,
        releaseDate: '2010-07-16',
        popularity: 90,
    },
    {
        id: 'm3',
        title: 'Interstellar',
        mediaType: 'movie',
        rating: 8.7,
        voteCount: 2000000,
        releaseDate: '2014-11-07',
        popularity: 95,
    },
    {
        id: 'm4',
        title: 'Dunkirk',
        mediaType: 'movie',
        rating: 7.8,
        voteCount: 700000,
        releaseDate: '2017-07-21',
        popularity: 80,
    },

    // TV Series
    {
        id: 'tv1',
        title: 'Game of Thrones',
        mediaType: 'tv',
        rating: 9.2,
        voteCount: 2200000,
        releaseDate: '2011-04-17',
        popularity: 120,
    },
    {
        id: 'tv2',
        title: 'Breaking Bad',
        mediaType: 'tv',
        rating: 9.5,
        voteCount: 2100000,
        releaseDate: '2008-01-20',
        popularity: 110,
        awards: ['emmy', 'gg'],
        awardCategories: ['best_drama_series', 'best_actor_drama'],
    },
    {
        id: 'tv3',
        title: 'Stranger Things',
        mediaType: 'tv',
        rating: 8.7,
        voteCount: 1300000,
        releaseDate: '2016-07-15',
        popularity: 130,
    },

    // Episodes
    {
        id: 'ep1',
        title: 'The Ghost of Harrenhal',
        mediaType: 'episode',
        parentSeriesTitle: 'Game of Thrones',
        seasonNumber: 2,
        episodeNumber: 5,
        rating: 8.8,
        releaseDate: '2012-04-29',
    },
    {
        id: 'ep2',
        title: 'Ozymandias',
        mediaType: 'episode',
        parentSeriesTitle: 'Breaking Bad',
        seasonNumber: 5,
        episodeNumber: 14,
        rating: 10.0,
        releaseDate: '2013-09-15',
    },

    // Games
    {
        id: 'g1',
        title: 'The Witcher 3: Wild Hunt',
        mediaType: 'game',
        rating: 9.7,
        voteCount: 600000,
        releaseDate: '2015-05-19',
        popularity: 85,
        awards: ['tga_goty', 'golden_joystick', 'bafta_games'],
        awardCategories: ['goty', 'best_rpg', 'best_story'],
    },
    {
        id: 'g2',
        title: 'Elden Ring',
        mediaType: 'game',
        rating: 9.6,
        voteCount: 500000,
        releaseDate: '2022-02-25',
        popularity: 150,
        awards: ['tga_goty', 'tga_art'],
        awardCategories: ['goty', 'best_art_direction', 'best_rpg'],
    },
    {
        id: 'g3',
        title: 'God of War Ragnarök',
        mediaType: 'game',
        rating: 9.5,
        voteCount: 400000,
        releaseDate: '2022-11-09',
        popularity: 140,
    },

    // People
    {
        id: 'p1',
        title: 'Christopher Nolan',
        mediaType: 'person',
        popularity: 90,
    },
    {
        id: 'p2',
        title: 'Cillian Murphy',
        mediaType: 'person',
        popularity: 95,
    },
    {
        id: 'p3',
        title: 'Hideo Kojima',
        mediaType: 'person',
        popularity: 80,
    },

    // Franchises
    {
        id: 'f1',
        title: 'The Dark Knight Trilogy',
        mediaType: 'franchise',
        popularity: 85,
    },
    {
        id: 'f2',
        title: 'Harry Potter Collection',
        mediaType: 'franchise',
        popularity: 92,
    },
    {
        id: 'f3',
        title: 'Marvel Cinematic Universe',
        mediaType: 'franchise',
        popularity: 100,
    }
];
