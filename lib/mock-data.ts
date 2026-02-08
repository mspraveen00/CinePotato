import { MockItem, ShelfType } from "@/lib/constants/explore";

export function generateMockItems(count: number, type: ShelfType): MockItem[] {
    return Array.from({ length: count }).map((_, i) => ({
        id: `${type}-${i}`,
        title: `Mock ${type === 'tv' ? 'Series' : type === 'games' ? 'Game' : 'Movie'} ${i + 1}`,
        posterUrl: "", // UI will handle empty state with a placeholder color
        rating: Number((5 + (i % 50) / 10).toFixed(1)), // Deterministic rating: 5.0 to 9.9
        year: 2020 + (i % 5), // Deterministic year
    }));
}
