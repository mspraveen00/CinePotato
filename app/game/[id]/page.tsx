export default async function GamePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return (
        <main className="min-h-screen bg-neutral-900 text-white pb-20">
            <div className="h-[40vh] bg-neutral-800 w-full relative">
                <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                    Game Art Placeholder (ID: {id})
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-48 h-64 bg-neutral-700 rounded-lg shadow-lg flex-shrink-0 flex items-center justify-center border border-neutral-600">
                        Cover Art
                    </div>

                    <div className="pt-20 md:pt-16">
                        <h1 className="text-4xl font-bold mb-2">Game Title</h1>
                        <div className="flex gap-4 text-sm text-neutral-400 mb-6">
                            <span>Publisher</span>
                            <span>•</span>
                            <span>Genre</span>
                        </div>
                        {/* Ratings Placeholder */}
                        <div className="mb-6 p-4 bg-neutral-800 rounded border border-neutral-700">
                            IGDB Rating: 85/100
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
