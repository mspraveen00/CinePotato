import { MockItem, ShelfType } from "@/lib/constants/explore"

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
