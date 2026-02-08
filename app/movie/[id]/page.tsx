export default async function MoviePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return (
        <main className="min-h-screen bg-neutral-900 text-white pb-20">
            {/* Hero Banner */}
            <div className="h-[40vh] bg-neutral-800 w-full relative">
                <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                    Backdrop Placeholder (ID: {id})
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Poster */}
                    <div className="w-48 h-72 bg-neutral-700 rounded-lg shadow-lg flex-shrink-0 flex items-center justify-center border border-neutral-600">
                        Poster
                    </div>

                    {/* Metadata */}
                    <div className="pt-20 md:pt-16">
                        <h1 className="text-4xl font-bold mb-2">Movie Title Placeholder</h1>
                        <div className="flex gap-4 text-sm text-neutral-400 mb-6">
                            <span>2024</span>
                            <span>•</span>
                            <span>2h 15m</span>
                            <span>•</span>
                            <span>Action, Adventure</span>
                        </div>

                        {/* Ratings */}
                        <div className="flex gap-6 mb-8">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-yellow-400">IMDb</span>
                                <span>-/-</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-red-500">RT</span>
                                <span>-/-</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-green-500">Meta</span>
                                <span>-/-</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-blue-400">TMDB</span>
                                <span>-/-</span>
                            </div>
                        </div>

                        <p className="text-neutral-300 leading-relaxed max-w-2xl">
                            Plot summary placeholder. This area will contain the overview of the movie fetched from TMDB.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
