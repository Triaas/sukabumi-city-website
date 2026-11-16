'use client'

import { Save, Loader2, X } from 'lucide-react'

interface ConfirmSaveDraftModalProps {
    isOpen: boolean
    isSaving?: boolean
    isPublished?: boolean
    onConfirmSaveDraft: () => void
    onDiscard: () => void
    onCancel: () => void
}

/**
 * Modal konfirmasi saat admin keluar dari form edit yang memiliki perubahan.
 * Pilihan "Ya" menyimpan perubahan (sebagai draf, atau tetap diterbitkan bila sudah tayang); "Tidak" membuang perubahan.
 */
export default function ConfirmSaveDraftModal({
    isOpen,
    isSaving = false,
    isPublished = false,
    onConfirmSaveDraft,
    onDiscard,
    onCancel,
}: ConfirmSaveDraftModalProps) {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[75] bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-save-draft-title"
        >
            <div className="relative bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <button
                    type="button"
                    disabled={isSaving}
                    onClick={onCancel}
                    aria-label="Kembali ke form edit"
                    className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors disabled:opacity-50"
                >
                    <X size={16} />
                </button>

                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto shadow-xs">
                    <Save size={24} />
                </div>

                <div>
                    <h4
                        id="confirm-save-draft-title"
                        className="font-bold text-[#172135] text-base tracking-tight"
                    >
                        Apakah ingin menyimpan perubahan?
                    </h4>
                    <p className="text-xs text-[#566276] mt-1.5 leading-relaxed">
                        Perubahan yang Anda buat belum tersimpan. Jika memilih{' '}
                        <span className="font-semibold text-[#172135]">Ya</span>,
                        perubahan akan disimpan{' '}
                        {isPublished
                            ? 'dengan status tetap diterbitkan.'
                            : 'sebagai draf.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={onDiscard}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        Tidak
                    </button>
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={onConfirmSaveDraft}
                        className="px-4 py-2.5 rounded-xl bg-[#159447] hover:bg-[#117a3a] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <span>Ya</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
