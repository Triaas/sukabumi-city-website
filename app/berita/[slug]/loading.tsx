export default function Loading() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white animate-pulse">
            {/* Spacer Navbar */}
            <div className="h-24 bg-[#1b293c]"></div>

            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1200px]">

                    {/* Skeleton Tombol Kembali */}
                    <div className="mb-8">
                        <div className="h-6 w-40 bg-slate-200 rounded-md"></div>
                    </div>

                    <div className="w-full">
                        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">

                            {/* Skeleton Judul & Meta */}
                            <div className="mb-8">
                                {/* Judul 2 Baris */}
                                <div className="h-10 w-full max-w-3xl bg-slate-200 rounded-md mb-4"></div>
                                <div className="h-10 w-2/3 max-w-xl bg-slate-200 rounded-md mb-6"></div>

                                {/* Tanggal & Penulis */}
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                                    <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                                </div>

                                {/* Skeleton Share Buttons */}
                                <div className="h-10 w-56 bg-slate-200 rounded-md"></div>
                            </div>

                            {/* Skeleton Gambar Utama (Featured Image) */}
                            <figure className="mb-10 w-full">
                                <div className="w-full h-[300px] md:h-[500px] rounded-xl bg-slate-200"></div>
                            </figure>

                            {/* Skeleton Paragraf Konten Berita */}
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-slate-200 rounded-md"></div>
                                <div className="h-4 w-full bg-slate-200 rounded-md"></div>
                                <div className="h-4 w-11/12 bg-slate-200 rounded-md"></div>
                                <div className="h-4 w-5/6 bg-slate-200 rounded-md"></div>
                                <div className="py-2"></div> {/* Spasi antar paragraf */}
                                <div className="h-4 w-full bg-slate-200 rounded-md"></div>
                                <div className="h-4 w-full bg-slate-200 rounded-md"></div>
                                <div className="h-4 w-4/5 bg-slate-200 rounded-md"></div>
                                <div className="py-2"></div>
                                <div className="h-4 w-full bg-slate-200 rounded-md"></div>
                                <div className="h-4 w-3/4 bg-slate-200 rounded-md"></div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}