'use client'

import { MapPin, Phone, Mail } from 'lucide-react'
import type { HeaderFooterSettings } from '@/lib/site-settings/types'
import { DEFAULT_HEADER_FOOTER_SETTINGS } from '@/lib/site-settings/defaults'

function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.882l7.73-8.835L1.08 2.25h6.82l4.713 6.231 5.45-6.231zM17.552 20.522h1.833L6.281 4.09H4.33l13.222 16.432z" />
    </svg>
  )
}

function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.63c-.79.297-1.427.772-1.944 1.289-.517.517-.992 1.155-1.289 1.944-.297.788-.498 1.658-.56 2.936C.015 8.333 0 8.74 0 12s.015 3.667.072 4.947c.062 1.278.263 2.148.56 2.936.297.788.772 1.427 1.289 1.944.517.517 1.155.992 1.944 1.289.788.297 1.658.498 2.936.56 1.28.057 1.687.072 4.947.072s3.667-.015 4.947-.072c1.280-.062 2.149-.263 2.937-.56.788-.297 1.426-.772 1.944-1.289.517-.517.992-1.155 1.289-1.944.297-.788.498-1.658.56-2.936.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.062-1.280-.263-2.149-.56-2.937-.297-.788-.772-1.426-1.289-1.944-.517-.517-1.155-.992-1.944-1.289-.788-.297-1.658-.498-2.937-.56C15.667.015 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.07 1.171.054 1.805.244 2.227.408.56.217.96.477 1.382.896.419.42.679.822.896 1.381.164.422.354 1.057.408 2.227.061 1.264.07 1.646.07 4.849 0 3.204-.009 3.586-.07 4.849-.054 1.171-.244 1.806-.408 2.228-.217.56-.477.96-.896 1.382-.42.419-.822.679-1.381.896-.422.164-1.057.354-2.227.408-1.264.061-1.646.07-4.849.07-3.204 0-3.586-.009-4.849-.07-1.171-.054-1.806-.244-2.228-.408-.56-.217-.96-.477-1.382-.896-.419-.42-.679-.822-.896-1.381-.164-.422-.354-1.057-.408-2.227-.061-1.264-.07-1.646-.07-4.849 0-3.204.009-3.586.07-4.849.054-1.171.244-1.806.408-2.228.217-.56.477-.96.896-1.382.42-.419.822-.679 1.381-.896.422-.164 1.057-.354 2.227-.408 1.264-.061 1.646-.07 4.849-.07zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
    </svg>
  )
}

function YoutubeLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function Footer({
  settings = DEFAULT_HEADER_FOOTER_SETTINGS,
}: {
  settings?: HeaderFooterSettings
}) {
  return (
    <footer id="footer" className="border-t-4 border-[#159447] bg-[#17253a] px-4 py-16 text-white md:px-8 lg:px-12 relative overflow-hidden">
      <div className="footer-dots absolute inset-0 pointer-events-none opacity-100" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-2 shadow-sm">
                <img
                  src={settings.footerLogoUrl || '/images/Lambang_Kota_Sukabumi.png'}
                  alt={settings.orgName || 'Lambang Kota Sukabumi'}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-white/75 leading-tight uppercase whitespace-nowrap">
                  {settings.topLabel}
                </p>
                <h3 className="text-base sm:text-lg font-bold leading-snug whitespace-nowrap">
                  {settings.orgName}
                </h3>
                <p className="font-serif text-xs sm:text-sm italic text-[#f4ce4b] leading-tight whitespace-nowrap mt-0.5">
                  {settings.mottoText}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {settings.footerDescription}
            </p>
            <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-white/80">
              <a
                href={settings.mapsUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-start gap-3"
              >
                <MapPin className="shrink-0 text-[#f04c71] group-hover:text-green-400 transition-colors mt-1" />
                <span>{settings.addressText}</span>
              </a>
              <a
                href={`tel:${settings.phoneTel || '+6226620229715'}`}
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
              >
                <Phone className="shrink-0 text-[#e8468a] group-hover:text-green-400 transition-colors" />
                <span>{settings.phoneDisplay}</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
              >
                <Mail className="shrink-0 text-[#e9c9eb] group-hover:text-green-400 transition-colors" />
                <span>Email : {settings.email}</span>
              </a>
            </div>
          </div>
          <div className="md:pl-6 lg:pl-14 xl:pl-10">
            <h3 className="text-lg font-bold">TAUTAN TERKAIT</h3>
            <div className="mt-8 flex flex-col gap-5 text-white/80">
              {settings.relatedLinks.map((item, idx) => (
                <a
                  key={`${item.label}-${idx}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">STANDAR PROTOKOL</h3>
            <a
              href="https://www.immuniweb.com/ssl/diskominfo.sukabumikota.go.id/nZuRpnLm/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <img src="/images/ImmuniWeb.webp" alt="ImmuniWeb Logo" className="mt-8 h-auto w-70" />
            </a>
          </div>
          <div>
            <h3 className="text-lg font-bold">MEDIA SOSIAL</h3>
            <div className="mt-8 flex gap-3.5">
              {settings.socialLinks.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1877F2]/30 active:scale-95"
                >
                  <FacebookLogo />
                </a>
              )}
              {settings.socialLinks.x && (
                <a
                  href={settings.socialLinks.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-black hover:border-white/30 hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 active:scale-95"
                >
                  <XLogo />
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#E4405F] hover:border-[#E4405F] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E4405F]/30 active:scale-95"
                >
                  <InstagramLogo />
                </a>
              )}
              {settings.socialLinks.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Youtube"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF0000]/30 active:scale-95"
                >
                  <YoutubeLogo />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-14 border-t border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/70">
          <div>Copyright © {new Date().getFullYear()} {settings.copyrightText}</div>
          <div>
            Dikelola oleh{' '}
            <a
              href={settings.managedByUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#4ade80] hover:text-green-300 hover:underline transition-colors"
            >
              {settings.managedByLabel}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
