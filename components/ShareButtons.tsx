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
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
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
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="4" x2="20" y2="20"></line>
            <line x1="20" y1="4" x2="4" y2="20"></line>
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
