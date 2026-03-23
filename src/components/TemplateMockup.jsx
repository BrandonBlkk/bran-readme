import { LinkIcon, MapPin } from "lucide-react"

const TemplateMockup = () => {
    return (
        <div className="mb-6 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-sans shadow-inner">
            {/* Name and Bio */}
            <div className="space-y-1">
            <div className="h-4 w-28 rounded bg-zinc-800" />
            <div className="h-2 w-40 rounded bg-zinc-900" />
            <div className="flex gap-2 pt-1">
                <div className="flex items-center gap-1">
                <MapPin size={8} className="text-zinc-600" />
                <div className="h-1.5 w-12 rounded bg-zinc-900" />
                </div>
                <div className="flex items-center gap-1">
                <LinkIcon size={8} className="text-blue-500/50" />
                <div className="h-1.5 w-8 rounded bg-blue-500/20" />
                </div>
            </div>
            </div>

            {/* Stats Section */}
            <div className="mt-4 border-t border-zinc-900 pt-4">
            <div className="mb-3 h-2 w-10 rounded bg-zinc-800" />
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full border border-blue-500/30" />
                    <div className="h-1.5 w-24 rounded bg-zinc-900" />
                    </div>
                ))}
                </div>
                {/* GitHub Contribution Circle Mimic */}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-zinc-900 border-t-blue-500 border-r-blue-500/50">
                <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-sm bg-zinc-800" />
                </div>
                </div>
            </div>
            </div>

            {/* Tech Stack Icons */}
            <div className="mt-5 flex gap-1.5">
            {['#61DAFB', '#3178C6', '#06B6D4', '#764ABC', '#339933'].map((color, i) => (
                <div key={i} className="h-6 w-6 rounded border border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
                <div style={{ backgroundColor: color }} className="h-2.5 w-2.5 rounded-sm opacity-80" />
                </div>
            ))}
            </div>
        </div>
    )
}

export default TemplateMockup