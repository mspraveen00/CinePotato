import { MockItem, ShelfType } from "@/lib/constants/explore"
import { TitleDetail } from "@/types/title"

const MOCK_TITLES: Record<ShelfType, string[]> = {
    movies: [],
    tv: [],
    games: []
}

const MOCK_COLORS = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500",
    "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500"
]

export function generateMockItems(count: number, type: ShelfType): MockItem[] {
    const items: MockItem[] = []
    for (let i = 0; i < count; i++) {
        // Simple sequential titles as requested
        const prefix = type === "movies" ? "Mock Movie" :
            type === "tv" ? "Mock Series" :
                "Mock Game"
        const title = `${prefix} ${i + 1}`

        items.push({
            id: `${type}-${i}-${Date.now()}-${Math.random()}`,
            title: title,
            posterUrl: MOCK_COLORS[i % MOCK_COLORS.length], // Using color classes for placeholder
            rating: Number((Math.random() * 5 + 5).toFixed(1)), // 5.0 to 10.0
            year: 2000 + Math.floor(Math.random() * 24)
        })
    }

    return items
}

export function generateMockDetail(id: string): TitleDetail {
    const randomColor = MOCK_COLORS[Math.floor(Math.random() * MOCK_COLORS.length)];

    return {
        id: id,
        title: `Mock Movie Detail ${id}`,
        overview: "This is a mock overview for the movie. In a real scenario, this would be fetched from TMDB. It describes the plot and main characters of the film.",
        backdropImages: [], // Empty for mock
        posterPath: "", // Empty string triggers placeholder logic if any, or we can use a color block in UI if supported. 
        // But UI expects string. 
        // The existing mock items use color classes for posterUrl, but TitleDetail uses posterPath (url).
        // Let's keep it empty or simple.
        releaseYear: 2024,
        runtime: "1h 30m",
        genres: ["Mock Action", "Mock Adventure"],
        rating: 7.5,
        logos: undefined
    }
}

export function generateMockTVDetail(id: string): TitleDetail {
    return {
        id: id,
        title: `Mock TV Series ${id}`,
        overview: "This is a mock overview for a TV series. It features multiple seasons and episodes.",
        backdropImages: [],
        posterPath: "",
        releaseYear: 2023,
        runtime: "45m",
        genres: ["Mock Drama", "Mock Sci-Fi"],
        rating: 8.2,
        logos: undefined
    }
}

export function generateMockPersonDetail(id: string): TitleDetail {
    return {
        id: id,
        title: `Mock Person ${id}`,
        overview: "This is a mock biography for a person. They are known for acting in various mock movies.",
        backdropImages: [],
        posterPath: "",
        releaseYear: 1980, // Birth year
        runtime: "N/A",
        genres: ["Acting"],
        rating: 0,
        logos: undefined
    }
}
