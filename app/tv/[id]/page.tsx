export default async function TVPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return (
        <main className="min-h-screen bg-neutral-900 text-white pb-20">
            <div className="h-[40vh] bg-neutral-800 w-full relative">
                <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                    TV Backdrop Placeholder (ID: {id})
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-48 h-72 bg-neutral-700 rounded-lg shadow-lg flex-shrink-0 flex items-center justify-center border border-neutral-600">
                        Poster
                    </div>

                    <div className="pt-20 md:pt-16">
                        <h1 className="text-4xl font-bold mb-2">TV Series Title</h1>
                        <div className="flex gap-4 text-sm text-neutral-400 mb-6">
                            <span>2022-Present</span>
                            <span>•</span>
                            <span>3 Seasons</span>
                        </div>
                        {/* Ratings Placeholder */}
                        <div className="mb-6 p-4 bg-neutral-800 rounded border border-neutral-700">
                            Ratings Block
                        </div>
                    </div>
                </div>

                {/* Seasons Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-semibold mb-6">Seasons</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-neutral-800 rounded border border-neutral-700">
                            <h3 className="font-bold">Season 1</h3>
                            <p className="text-sm text-neutral-400">Episodes placeholder</p>
                        </div>
                        <div className="p-4 bg-neutral-800 rounded border border-neutral-700">
                            <h3 className="font-bold">Season 2</h3>
                            <p className="text-sm text-neutral-400">Episodes placeholder</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
