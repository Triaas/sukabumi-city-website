'use client'

import { MapPin, Phone, Mail } from 'lucide-react'

// Social Media Logo Components
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

export function Footer() {
  return (
    <footer id="footer" className="border-t-4 border-[#159447] bg-[#17253a] px-4 py-16 text-white md:px-8 lg:px-12 relative overflow-hidden">
      {/* Dotted background pattern */}
      <div className="footer-dots absolute inset-0 pointer-events-none opacity-100" />

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold">KONTAK</h3>
            <a
              href="https://diskominfo.sukabumikota.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <img src="/images/Diskominfo.webp" alt="Diskominfo Logo" className="mt-8 h-auto w-74" />
            </a>
            <div className="mt-8 flex flex-col gap-5 text-sm leading-relaxed text-white/80">
              <a
                href="https://maps.app.goo.gl/CmbbaNogyg1h8DBA7"
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-start gap-3"
              >
                <MapPin className="shrink-0 text-[#f04c71] group-hover:text-green-400 transition-colors mt-1" />
                <span>Alamat : Jl. R. Syamsudin, SH No.25, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113</span>
              </a>
              <a
                href="tel:+6226620229715"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
              >
                <Phone className="shrink-0 text-[#e8468a] group-hover:text-green-400 transition-colors" />
                <span>Telp : +62 (266) 20229715</span>
              </a>
              <a
                href="mailto:diskominfo@sukabumikota.go.id"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
              >
                <Mail className="shrink-0 text-[#e9c9eb] group-hover:text-green-400 transition-colors" />
                <span>Email : diskominfo@sukabumikota.go.id</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">TAUTAN TERKAIT</h3>
            <div className="mt-8 flex flex-col gap-5 text-white/80">
              <a
                href="https://lpse.jabarprov.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3">Layanan Pengadaan LPSE</a>
              <a href="https://ppid.sukabumikota.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3"
              >Layanan Informasi Publik (PPID)</a>
              <a href="https://jdih.sukabumikota.go.id/beranda"
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer hover:text-green-400 transition-colors inline-flex items-center gap-3">Layanan Informasi Hukum (JDIH)</a>
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
            <div className="mt-8 flex gap-4">
              <a
                href="https://www.facebook.com/kotasukabumi.id?locale=id_ID"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#159447] text-white hover:opacity-80 transition"
              >
                <FacebookLogo />
              </a>
              <a
                href="https://x.com/Pemkot_Sukabumi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#159447] text-white hover:opacity-80 transition"
              >
                <XLogo />
              </a>
              <a
                href="https://www.instagram.com/pemkotsukabumi_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#159447] text-white hover:opacity-80 transition"
              >
                <InstagramLogo />
              </a>
              <a
                href="https://www.youtube.com/@pemerintahkotasukabumi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#159447] text-white hover:opacity-80 transition"
              >
                <YoutubeLogo />
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-[1400px] border-t border-white/15 pt-8 text-center text-sm text-white/80">Copyright © 2026 Website Resmi Pemerintah Kota Sukabumi</div>
      </div>
    </footer>
  )
}
