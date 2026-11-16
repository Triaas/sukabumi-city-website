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

export default function BeritaNotification({ notifKey }: BeritaNotificationProps) {
    const message = notifKey ? NOTIFICATION_MESSAGES[notifKey] ?? null : null
    const [visibleMessage, setVisibleMessage] = useState<string | null>(message)

    useEffect(() => {
        if (!notifKey || !NOTIFICATION_MESSAGES[notifKey]) {
            setVisibleMessage(null)
            return
        }

        setVisibleMessage(NOTIFICATION_MESSAGES[notifKey])

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

    return (
        <ToastNotification
            message={visibleMessage}
            type="success"
            onClose={() => setVisibleMessage(null)}
        />
    )
}

