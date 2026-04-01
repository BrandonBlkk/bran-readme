const TemplateSkeleton = () => {
    return (
        <article className="relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-5 animate-pulse">
            {/* Mockup Placeholder */}
            <div className="mb-5 aspect-video w-full h-52.5 rounded-xl bg-zinc-900" />

            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 mt-1">
                    {/* Title Line */}
                    <div className="h-4 w-3/4 rounded bg-zinc-800" />
                    
                    {/* Description Lines */}
                    <div className="mt-3 space-y-2">
                        <div className="h-2.5 w-full rounded bg-zinc-900" />
                    </div>
                    
                    {/* Meta Line */}
                    <div className="mt-4 h-2 w-1/2 rounded bg-zinc-900" />
                </div>

                {/* Favorite Button Placeholder */}
                <div className="h-8 w-8 shrink-0 rounded-lg bg-zinc-900" />
            </div>

            {/* Tags Placeholder */}
            <div className="mt-5 flex flex-wrap gap-2">
                <div className="h-6 w-12 rounded-full bg-zinc-900" />
                <div className="h-6 w-16 rounded-full bg-zinc-900" />
                <div className="h-6 w-10 rounded-full bg-zinc-900" />
            </div>

            {/* Action Buttons Placeholder */}
            <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="h-10 rounded-xl bg-zinc-900" />
                <div className="h-10 rounded-xl bg-zinc-800/50" />
            </div>
        </article>
    )
}

export default TemplateSkeleton
