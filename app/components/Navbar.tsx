'use client'

import { Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export function Navbar({ isIframeOpen }: { isIframeOpen?: boolean }) {
  if (isIframeOpen) return null

  const [activeSection, setActiveSection] = useState('beranda')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({})
  const isScrollingRef = useRef(false)

  // Navigation items that correspond to page sections (tracked for active state)
  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'profil', label: 'Profil' },
    { id: 'berita', label: 'Pengumuman & Berita' },
    { id: 'opd', label: 'Situs OPD' },
    { id: 'transparansi', label: 'Transparansi Dokumen' },
  ]

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = itemRefs.current[activeSection]
      if (activeEl && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect()
        const itemRect = activeEl.getBoundingClientRect()
        setIndicatorStyle({
          left: itemRect.left - navRect.left,
          width: itemRect.width,
        })
      }
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeSection])

  useEffect(() => {
    let lastActiveSection: string = 'beranda'

    const handleScroll = () => {
      // Skip scroll-spy during programmatic navigation
      if (isScrollingRef.current) return

      const scrollPosition = window.scrollY + window.innerHeight * 0.4

      for (let i = navItems.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(navItems[i].id)
        if (sectionEl) {
          // Use getBoundingClientRect for accurate position
          const rect = sectionEl.getBoundingClientRect()
          const absoluteTop = rect.top + window.scrollY
          if (scrollPosition >= absoluteTop) {
            setActiveSection(navItems[i].id)
            lastActiveSection = navItems[i].id
            return
          }
        }
      }
    }

    // If no section matches, keep the last active section
    // This prevents jumping back to beranda after scrolling past transparansi
    setActiveSection(lastActiveSection)

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header id="main-navbar" className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 lg:px-12 flex justify-center w-full">
      <div className="w-full max-w-[1400px] bg-slate-900/70 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 px-6 py-3 shadow-xl transition-all duration-300 flex items-center justify-between gap-8 md:gap-12">
        <div className="flex items-center gap-3.5 md:gap-4">
          <img
            src="/logo.png"
            alt="Logo Kota Sukabumi"
            className="h-14 sm:h-16 md:h-[68px] w-auto object-contain shrink-0"
          />
          <div className="flex flex-col justify-between py-0.5">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] text-white/75 leading-tight">
              WEBSITE RESMI
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
              Pemerintah Kota Sukabumi
            </p>
            <p className="font-serif text-xs sm:text-sm md:text-base italic text-[#f4ce4b] leading-tight">
              Reugreug Pageuh Repeh Rapih
            </p>
          </div>
        </div>

        <nav ref={navRef} className="relative hidden items-center gap-4 md:gap-6 lg:gap-8 text-base font-semibold lg:flex py-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <a
                key={item.id}
                ref={(el) => { itemRefs.current[item.id] = el }}
                href={`/#${item.id}`}
                onClick={(e) => {
                  // Check if we're already on the home page
                  if (window.location.pathname === '/') {
                    e.preventDefault()

                    // Disable scroll-spy during programmatic navigation
                    isScrollingRef.current = true
                    setActiveSection(item.id)

                    const el = document.getElementById(item.id)
                    if (el) {
                      const rect = el.getBoundingClientRect()
                      const offsetTop = rect.top + window.scrollY - 100
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' })

                      // Re-enable scroll-spy after animation completes
                      setTimeout(() => {
                        isScrollingRef.current = false
                      }, 1000) // 1 second to allow smooth scroll to complete
                    }
                  }
                  // If not on home page, let the browser handle navigation
                }}
                className={`pb-1 transition-colors duration-200 ${isActive ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
              >
                {item.label}
              </a>
            )
          })}

          {/* Kebijakan Privasi - Standard link without active state */}
          <a
            href="/kebijakan-privasi"
            className="pb-1 text-slate-300 hover:text-white transition-colors duration-200"
          >
            Kebijakan Privasi
          </a>

          <span
            className="absolute bottom-0 bg-[#f9c74f] h-[3px] rounded-full transition-all duration-300 ease-in-out pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </nav>

        <button className="rounded-lg p-2 text-white lg:hidden" aria-label="Buka pencarian">
          <Search />
        </button>
      </div>
    </header>
  )
}
