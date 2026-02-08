import { ExternalLink } from "lucide-react"

// Letterboxd Icon (3 Circles: Orange, Green, Blue)
const LetterboxdIcon = ({ className }: { className?: string }) => (
    <svg
        role="img"
        viewBox="0 0 24 24"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <title>Letterboxd</title>
        <circle cx="5" cy="12" r="4.5" fill="#FF8000" />
        <circle cx="12" cy="12" r="4.5" fill="#00E054" />
        <circle cx="19" cy="12" r="4.5" fill="#40BCF4" />
    </svg>
)

export function LetterboxdSection() {
    return (
        <section className="px-4 md:px-8 py-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-900 to-black p-1 border border-white/10 group cursor-pointer hover:border-green-500/50 transition-colors">
                <a
                    href="https://letterboxd.com/lists/featured/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-black/40 backdrop-blur-sm p-6 rounded-xl hover:bg-black/20 transition-colors"
                >
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white">
                                <LetterboxdIcon className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">Letterboxd Featured Lists</h3>
                        </div>
                        <p className="text-neutral-400 max-w-md pl-[52px]">
                            Discover curated lists from the world's best movie tracking community.
                        </p>
                    </div>
                    <ExternalLink className="text-neutral-500 group-hover:text-green-400 transition-colors" size={24} />
                </a>
            </div>
        </section>
    )
}
