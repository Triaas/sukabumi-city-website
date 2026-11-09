'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteNewsAction } from '@/app/(admin)/admin/berita/actions'

interface DeleteNewsButtonProps {
    id: number | string
    title: string
    disabled?: boolean
    disabledTitle?: string
}

export default function DeleteNewsButton({
    id,
    title,
    disabled = false,
    disabledTitle = 'Tidak dapat dihapus',
}: DeleteNewsButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleConfirmDelete = () => {
        if (isPending) return

        startTransition(async () => {
            const res = await deleteNewsAction(id)
            if (!res.success) {
                alert(res.error || 'Gagal menghapus berita.')
            } else {
                setIsOpen(false)
            }
        })
    }

    if (disabled) {
        return (
            <button
                type="button"
                disabled
                title={disabledTitle}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 opacity-60 flex items-center justify-center cursor-not-allowed"
            >
                <Trash2 size={14} />
            </button>
        )
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title="Hapus Berita"
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
            >
                <Trash2 size={14} />
            </button>

            {/* Modal Konfirmasi Sesuai Desain Gambar 2 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={() => {
                        if (!isPending) setIsOpen(false)
                    }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon Lingkaran di Atas (Identik Gambar 2) */}
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border-2 border-red-100 text-red-600">
                                <Trash2 className="h-6 w-6 stroke-[2]" />
                            </div>

                            {/* Judul Modal */}
                            <h3 className="mb-2 text-lg font-bold text-[#1b293c]">
                                Konfirmasi Hapus
                            </h3>

                            {/* Pesan Keterangan */}
                            <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                                Apakah yakin ingin menghapus berita ini?
                            </p>

                            {/* Preview Singkat Judul Berita */}
                            {title && (
                                <p className="mb-6 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 line-clamp-2 w-full text-center whitespace-normal">
                                    &ldquo;{title}&rdquo;
                                </p>
                            )}

                            {/* Tombol Aksi Tidak & Ya */}
                            <div className="flex w-full gap-3">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Tidak
                                </button>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={handleConfirmDelete}
                                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-70"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin text-white" />
                                            <span>Menghapus...</span>
                                        </>
                                    ) : (
                                        <span>Ya</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
