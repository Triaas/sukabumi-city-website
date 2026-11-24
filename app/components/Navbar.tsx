'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import type { HeaderFooterSettings } from '@/lib/site-settings/types'
import { DEFAULT_HEADER_FOOTER_SETTINGS } from '@/lib/site-settings/defaults'

export function Navbar({
  isIframeOpen,
  settings = DEFAULT_HEADER_FOOTER_SETTINGS,
}: {
  isIframeOpen?: boolean
  settings?: HeaderFooterSettings
}) {
  if (isIframeOpen) return null

  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState('beranda')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({})
  const isScrollingRef = useRef(false)

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/#beranda' },
    { id: 'profil', label: 'Profil', href: '/#profil' },
    { id: 'berita', label: 'Pengumuman & Berita', href: '/#berita' },
    { id: 'opd', label: 'Situs OPD', href: '/#opd' },
    { id: 'transparansi', label: 'Transparansi Dokumen', href: '/#transparansi' },
    { id: 'kebijakan-privasi', label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
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
    if (pathname !== '/') {
      if (pathname === '/kebijakan-privasi') {
        setActiveSection('kebijakan-privasi')
      } else if (pathname.startsWith('/berita') || pathname.startsWith('/pengumuman')) {
        setActiveSection('berita')
      }
      return
    }

    let lastActiveSection: string = 'beranda'

    const handleScroll = () => {
      if (isScrollingRef.current) return

      const scrollPosition = window.scrollY + window.innerHeight * 0.4

      for (let i = navItems.length - 1; i >= 0; i--) {
        if (navItems[i].id === 'kebijakan-privasi') continue
        
        const sectionEl = document.getElementById(navItems[i].id)
        if (sectionEl) {
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

    setActiveSection(lastActiveSection)

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  const handleNavItemClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: { id: string; href: string }
  ) => {
    setIsMobileMenuOpen(false)
    if (item.href.startsWith('/#') && window.location.pathname === '/') {
      e.preventDefault()

      isScrollingRef.current = true
      setActiveSection(item.id)

      const el = document.getElementById(item.id)
      if (el) {
        const rect = el.getBoundingClientRect()
        const offsetTop = rect.top + window.scrollY - 100
        window.scrollTo({ top: offsetTop, behavior: 'smooth' })

        setTimeout(() => {
          isScrollingRef.current = false
        }, 1000)
      }
    }
  }

  return (
    <header id="main-navbar" className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-4 md:px-8 lg:px-12 flex flex-col items-center w-full">
      <div className="w-full max-w-[1400px] bg-slate-900/75 backdrop-blur-md rounded-2xl border border-white/10 px-3.5 py-2 sm:px-6 sm:py-3 shadow-xl transition-all duration-300 flex items-center justify-between gap-3 sm:gap-8 md:gap-12">
        <Link
          href="/"
          onClick={(e) => {
            setIsMobileMenuOpen(false)
            if (pathname === '/') {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
              setActiveSection('beranda')
            }
          }}
          className="flex items-center gap-2 sm:gap-3.5 md:gap-4 group cursor-pointer min-w-0"
        >
          <img
            src={settings.headerLogoUrl || '/logo.png'}
            alt={settings.orgName || 'Logo Kota Sukabumi'}
            className="h-9 sm:h-14 md:h-[68px] w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-200"
          />
          <div className="flex flex-col justify-between gap-0.5 sm:gap-1 py-0.5 min-w-0">
            <p className="text-[9px] sm:text-xs font-semibold tracking-[0.12em] text-white/75 leading-tight truncate">
              {settings.topLabel}
            </p>
            <p className="text-sm sm:text-xl md:text-2xl font-bold text-white leading-tight truncate">
              {settings.orgName}
            </p>
            <p className="font-serif text-[10px] sm:text-sm md:text-base italic text-[#f4ce4b] leading-tight truncate">
              {settings.mottoText}
            </p>
          </div>
        </Link>

        <nav ref={navRef} className="relative hidden items-center gap-4 md:gap-6 lg:gap-8 text-base font-semibold lg:flex py-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <a
                key={item.id}
                ref={(el) => { itemRefs.current[item.id] = el }}
                href={item.href}
                onClick={(e) => handleNavItemClick(e, item)}
                className={`pb-1 transition-colors duration-200 ${isActive ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
              >
                {item.label}
              </a>
            )
          })}

          <span
            className="absolute bottom-0 bg-[#f9c74f] h-[3px] rounded-full transition-all duration-300 ease-in-out pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </nav>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 min-h-[44px] min-w-[44px] text-white transition-colors hover:bg-white/20 lg:hidden shrink-0"
          aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav
          id="mobile-nav-menu"
          aria-label="Navigasi mobile"
          className="mt-2 w-full max-w-[1400px] rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavItemClick(e, item)}
                    className={`flex min-h-[44px] items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-white/10 text-[#f9c74f]'
                        : 'text-slate-200 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
