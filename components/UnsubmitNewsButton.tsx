'use client'

import { useState, useTransition } from 'react'
import { Undo2, Loader2 } from 'lucide-react'
import {
    unpublishNewsAction,
    unsubmitNewsAction,
} from '@/app/(admin)/admin/berita/actions'

interface UnsubmitNewsButtonProps {
    id: number | string
    title: string
    mode: 'UNPUBLISH' | 'UNSUBMIT'
}

export default function UnsubmitNewsButton({
    id,
    title,
    mode,
}: UnsubmitNewsButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const isUnpublish = mode === 'UNPUBLISH'

    const buttonTooltip = isUnpublish
        ? 'Turunkan Tayang ke Draf (Unpublish)'
        : 'Tarik Naskah ke Draf (Unsubmit)'

    const modalTitle = isUnpublish
        ? 'Konfirmasi Turunkan Berita'
        : 'Konfirmasi Tarik Naskah'

    const modalMessage = isUnpublish
        ? 'Apakah yakin ingin menurunkan berita ini kembali ke draf?'
        : 'Apakah yakin ingin menarik naskah ini kembali ke draf?'

    const loadingText = isUnpublish ? 'Menurunkan...' : 'Menarik...'

    const handleConfirm = () => {
        if (isPending) return

        startTransition(async () => {
            const res = isUnpublish
                ? await unpublishNewsAction(id)
                : await unsubmitNewsAction(id)

            if (!res.success) {
                alert(
                    res.error ||
                        (isUnpublish
                            ? 'Gagal menurunkan penayangan berita.'
                            : 'Gagal menarik naskah berita.')
                )
            } else {
                setIsOpen(false)
            }
        })
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title={buttonTooltip}
                className="w-7 h-7 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 flex items-center justify-center transition-colors cursor-pointer"
            >
                <Undo2 size={14} />
            </button>

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
                            {/* Icon Lingkaran di Atas */}
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-100 text-amber-600">
                                <Undo2 className="h-6 w-6 stroke-[2]" />
                            </div>

                            {/* Judul Modal */}
                            <h3 className="mb-2 text-lg font-bold text-[#1b293c]">
                                {modalTitle}
                            </h3>

                            {/* Pesan Keterangan */}
                            <p className="mb-3 text-sm text-[#66758a] whitespace-normal">
                                {modalMessage}
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
                                    onClick={handleConfirm}
                                    className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-70"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin text-white"
                                            />
                                            <span>{loadingText}</span>
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

