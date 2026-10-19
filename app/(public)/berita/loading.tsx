export default function Loading() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Skeleton Hero Banner */}
            <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-slate-300 animate-pulse">
                <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1400px] relative z-10">
                    <div className="h-5 w-48 bg-slate-400/50 rounded mb-8"></div>
                    <div className="h-12 md:h-16 w-3/4 max-w-sm bg-slate-400/50 rounded mb-5"></div>
                    <div className="h-6 w-full max-w-xl bg-slate-400/50 rounded"></div>
                </div>
            </section>

            {/* Skeleton Content */}
            <div className="py-12 px-4 md:px-8 lg:px-12">
                <div className="mx-auto max-w-[1400px]">

                    {/* Skeleton Filter Dropdown */}
                    <div className="mb-10 pb-4 border-b border-slate-200 animate-pulse">
                        <div className="h-12 w-full sm:w-[220px] bg-slate-200 rounded-xl"></div>
                    </div>

                    {/* Skeleton Grid Kartu Berita */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col animate-pulse"
                            >
                                {/* Skeleton Image (Tingginya h-36 menyesuaikan kode aslimu) */}
                                <div className="h-36 bg-slate-200"></div>

                                {/* Skeleton Text */}
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="h-3 w-20 bg-slate-200 rounded mb-4"></div>
                                    <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
                                    <div className="h-4 w-2/3 bg-slate-200 rounded mb-6 flex-1"></div>
                                    <div className="h-3 w-24 bg-slate-200 rounded mt-auto"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </main>
    )
}