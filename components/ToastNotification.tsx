'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

interface ToastNotificationProps {
    message: string | null | undefined
    type?: 'success' | 'error'
    duration?: number
    onClose: () => void
}

export default function ToastNotification({
    message,
    type = 'success',
    duration = 1500,
    onClose,
}: ToastNotificationProps) {
    const onCloseRef = useRef(onClose)
    onCloseRef.current = onClose

    useEffect(() => {
        if (!message) return
        const timer = setTimeout(() => {
            onCloseRef.current()
        }, duration)
        return () => clearTimeout(timer)
    }, [message, duration])

    if (!message) return null

    const isSuccess = type === 'success'

    return (
        <div
            role={isSuccess ? 'status' : 'alert'}
            aria-live="polite"
            className={`fixed top-6 right-6 z-[110] max-w-[396px] w-[calc(100vw-3rem)] sm:w-auto flex items-center justify-between gap-3.5 px-[18px] py-3.5 rounded-xl border text-[13px] font-semibold shadow-lg animate-in fade-in slide-in-from-top-3 duration-200 ${
                isSuccess
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
            }`}
        >
            <div className="flex items-center gap-3">
                {isSuccess ? (
                    <CheckCircle2
                        size={19}
                        className="shrink-0 text-emerald-600"
                        aria-hidden="true"
                    />
                ) : (
                    <AlertCircle
                        size={19}
                        className="shrink-0 text-red-500"
                        aria-hidden="true"
                    />
                )}
                <span>{message}</span>
            </div>
            <button
                type="button"
                onClick={() => onCloseRef.current()}
                title="Tutup notifikasi"
                aria-label="Tutup notifikasi"
                className="text-slate-500 hover:text-slate-700 p-0.5 rounded-md transition-colors cursor-pointer shrink-0"
            >
                <X size={15} aria-hidden="true" />
            </button>
        </div>
    )
}
