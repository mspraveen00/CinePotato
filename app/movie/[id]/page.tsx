import HeroBanner from '@/components/title/HeroBanner';
import { TitleDetail } from '@/types/title';

export default async function MoviePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    // Mock Data (Replace with real data fetching later)
    const mockTitleDetail: TitleDetail = {
        id: id,
        title: "Dune: Part Two",
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.",
        backdropImages: [
            "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
            "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
            "https://image.tmdb.org/t/p/original/lzWHmYdfeFiMIY4JaMmtR7GEli3.jpg"
        ],
        posterPath: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        releaseYear: 2024,
        runtime: "2h 46m",
        genres: ["Science Fiction", "Adventure"],
        rating: 8.3,
        // logoPath: "https://image.tmdb.org/t/p/original/51tqzRtKMMZEYUpSYkrUE7v9ehm.png" // Comment out to test text fallback
    };

    return (
        <main className="min-h-screen bg-neutral-900 text-white pb-20">
            <HeroBanner titleDetail={mockTitleDetail} />

            <div className="container mx-auto px-4 relative z-10 mt-12">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Space for the floating poster (desktop) */}
                    <div className="hidden md:block w-64 flex-shrink-0" />

                    <div className="flex-1 space-y-8">
                        {/* Plot Summary */}
                        <section>
                            <h3 className="text-xl font-bold mb-4">Plot Summary</h3>
                            <p className="text-neutral-300 leading-relaxed text-lg max-w-3xl">
                                {mockTitleDetail.overview}
                            </p>
                        </section>

                        {/* Cast Placeholder */}
                        <section>
                            <h3 className="text-xl font-bold mb-4">Top Cast</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-32 flex-shrink-0">
                                        <div className="aspect-[2/3] bg-neutral-800 rounded-lg mb-2" />
                                        <div className="h-4 w-24 bg-neutral-800 rounded mb-1" />
                                        <div className="h-3 w-16 bg-neutral-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}
