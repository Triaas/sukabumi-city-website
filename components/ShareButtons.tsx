'use client'

import { useState } from 'react'
import { Link as LinkIcon, Check } from 'lucide-react'

interface ShareButtonsProps {
  title: string
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = (platform: 'wa' | 'fb' | 'x' | 'copy') => {
    if (typeof window === 'undefined') return
    const currentUrl = window.location.href
    const encodedUrl = encodeURIComponent(currentUrl)
    const encodedTitle = encodeURIComponent(title)

    switch (platform) {
      case 'wa':
        window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, '_blank', 'noopener,noreferrer')
        break
      case 'fb':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer')
        break
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank', 'noopener,noreferrer')
        break
      case 'copy':
        navigator.clipboard.writeText(currentUrl).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }).catch(() => {})
        break
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-[#1d293d] text-sm md:text-base font-medium">Bagikan:</span>
      <div className="flex items-center gap-2">
        {/* WhatsApp */}
        <button
          onClick={() => handleShare('wa')}
          className="grid place-items-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#25D366] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          title="Bagikan ke WhatsApp"
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.531.078-1.203.109-1.938-.125-.453-.141-1.031-.344-1.766-.656-3.094-1.328-5.109-4.453-5.266-4.656-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.313.609-.391.813-.391.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.281.5-.141.172-.297.375-.422.5-.141.141-.281.297-.125.578.156.281.703 1.156 1.516 1.875 1.047.938 1.922 1.234 2.203 1.375.281.141.438.109.609-.078.172-.188.719-.844.906-1.125.188-.281.391-.234.656-.141.266.094 1.703.797 1.984.938.281.141.469.219.547.344.078.125.078.734-.172 1.438z" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleShare('fb')}
          className="grid place-items-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#3b5998] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          title="Bagikan ke Facebook"
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/>
          </svg>
        </button>

        {/* X (Twitter) */}
        <button
          onClick={() => handleShare('x')}
          className="grid place-items-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-black text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          title="Bagikan ke X"
          type="button"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.882l7.73-8.835L1.08 2.25h6.82l4.713 6.231 5.45-6.231zM17.552 20.522h1.833L6.281 4.09H4.33l13.222 16.432z" />
          </svg>
        </button>

        {/* Copy Link */}
        <div className="relative">
          <button
            onClick={() => handleShare('copy')}
            className={`grid place-items-center w-9 h-9 md:w-10 md:h-10 rounded-full text-white transition-all cursor-pointer shadow-sm active:scale-95 ${
              copied ? 'bg-[#159447]' : 'bg-[#64748b] hover:bg-[#475569]'
            }`}
            title={copied ? "Tautan Berhasil Disalin!" : "Salin Tautan"}
            type="button"
          >
            {copied ? <Check size={18} /> : <LinkIcon size={18} />}
          </button>
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1 rounded shadow animate-fade-in pointer-events-none">
              Tersalin!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
