import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased">
            {/* Subtle Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center px-6 text-center">
                <div className="mb-6 flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400 select-none">
                    Error 404
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
                    Lost in the{" "}
                <span className="bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                    void
                </span>
                </h1>

                {/* Divider */}
                <div className="my-8 h-px w-24 rounded-full bg-linear-to-r from-transparent via-zinc-700 to-transparent" />

                <p className="max-w-md text-balance text-sm leading-relaxed text-zinc-400 md:text-lg">
                    The page you're looking for has either vanished into digital dust 
                    or was moved to a new dimension.
                </p>

                <Link
                to="/"
                className="group mt-10 flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 select-none"
                >
                    <LayoutDashboard size={16} className="shrink-0" />
                    <span className="leading-none">Return to Workspace</span>
                    <ArrowRight 
                        size={16} 
                        className="shrink-0 transition-transform group-hover:translate-x-1" 
                    />
                </Link>
                
                <p className="mt-20 text-[10px] uppercase tracking-widest text-zinc-600">
                    © 2026 BranReadme — System Navigation
                </p>
            </div>
        </div>
    );
}