'use client'

import { useEffect, useState } from 'react'
import ToastNotification from '@/components/ToastNotification'

const NOTIFICATION_MESSAGES: Record<string, string> = {
    draft_saved: 'Draf berita berhasil disimpan.',
    draft_updated: 'Perubahan draf berita berhasil disimpan.',
    published: 'Berita berhasil diterbitkan ke portal publik.',
    published_updated: 'Berita berhasil diperbarui dan diterbitkan ke portal publik.',
    submitted: 'Berita berhasil dikirim untuk peninjauan redaksi.',
}

interface BeritaNotificationProps {
    notifKey?: string
}

export interface BeritaToastDetail {
    message: string
    type: 'success' | 'error'
}

export const BERITA_TOAST_EVENT = 'berita:toast'

export function dispatchBeritaToast(
    message: string,
    type: 'success' | 'error' = 'success'
) {
    if (typeof window === 'undefined') return
    window.dispatchEvent(
        new CustomEvent<BeritaToastDetail>(BERITA_TOAST_EVENT, {
            detail: { message, type },
        })
    )
}

export default function BeritaNotification({ notifKey }: BeritaNotificationProps) {
    const initialMessage = notifKey ? NOTIFICATION_MESSAGES[notifKey] ?? null : null
    const [toast, setToast] = useState<BeritaToastDetail | null>(
        initialMessage ? { message: initialMessage, type: 'success' } : null
    )

    useEffect(() => {
        if (!notifKey || !NOTIFICATION_MESSAGES[notifKey]) {
            return
        }

        setToast({ message: NOTIFICATION_MESSAGES[notifKey], type: 'success' })

        // Bersihkan query parameter ?notif=... dari URL agar tidak muncul ulang saat halaman di-refresh
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            if (url.searchParams.has('notif')) {
                url.searchParams.delete('notif')
                const cleanUrl =
                    url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '')
                window.history.replaceState({}, '', cleanUrl)
            }
        }
    }, [notifKey])

    useEffect(() => {
        const handleToastEvent = (e: Event) => {
            const customEvent = e as CustomEvent<BeritaToastDetail>
            if (customEvent.detail?.message) {
                setToast({
                    message: customEvent.detail.message,
                    type: customEvent.detail.type ?? 'success',
                })
            }
        }

        window.addEventListener(BERITA_TOAST_EVENT, handleToastEvent)
        return () => window.removeEventListener(BERITA_TOAST_EVENT, handleToastEvent)
    }, [])

    return (
        <ToastNotification
            message={toast?.message}
            type={toast?.type}
            onClose={() => setToast(null)}
        />
    )
}

