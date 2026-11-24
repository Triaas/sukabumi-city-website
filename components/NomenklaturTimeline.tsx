'use client'

import { useEffect, useRef, useState } from 'react'

export interface TimelineItem {
  period: string
  badge: string
  title: string
  description: string
}

export default function NomenklaturTimeline({
  title,
  items,
  hasQuickLinks = false,
}: {
  title: string
  items: TimelineItem[]
  hasQuickLinks?: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [highlightRunId, setHighlightRunId] = useState(0)
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([])
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!items || items.length === 0) return

    const handleScroll = () => {
      const triggerOffset = window.innerWidth >= 1280 ? 220 : 240
      let current = 0

      for (let i = 0; i < items.length; i++) {
        const el = document.getElementById(`nomenklatur-${i}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= triggerOffset) {
            current = i
          }
        }
      }

      setActiveIndex(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items])

  useEffect(() => {
    const activePill = pillRefs.current[activeIndex]
    if (activePill) {
      activePill.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      })
    }
  }, [activeIndex])

  const handleYearClick = (idx: number) => {
    const el = document.getElementById(`nomenklatur-${idx}`)
    if (!el) return

    setActiveIndex(idx)
    setHighlightedIndex(idx)
    setHighlightRunId((n) => n + 1)
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
    }
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedIndex(null)
    }, 650)

    const offset =
      window.innerWidth >= 1280 ? 185 : hasQuickLinks ? 200 : 145
    const targetTop =
      el.getBoundingClientRect().top + window.scrollY - offset

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    })
  }

  if (!items || items.length === 0) return null

  const stickyTopClass = hasQuickLinks
    ? 'top-[126px] sm:top-[154px] xl:top-[108px]'
    : 'top-[76px] md:top-[108px]'

  return (
    <div
      id="nomenklatur"
      className="mt-16 pt-8 border-t border-gray-100 scroll-mt-36"
    >
      <div className="text-center mb-3 md:mb-4 px-2">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#172135] leading-snug max-w-[280px] sm:max-w-none mx-auto">
          {title}
        </h3>
        <div className="h-1 w-16 sm:w-20 bg-[#159447] rounded-full mx-auto mt-3 mb-4 md:mt-4 md:mb-6" />
      </div>

      {/* Sticky Year Bar */}
      <div
        className={`sticky ${stickyTopClass} z-30 bg-white/95 backdrop-blur-md border-y border-slate-100 -mx-4 px-4 md:-mx-6 md:px-6 py-2.5 mb-8`}
      >
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2 max-w-3xl mx-auto overflow-x-auto hide-scrollbar">
          {items.map((item, idx) => {
            const isActive = activeIndex === idx
            return (
              <button
                key={`nav-${idx}`}
                ref={(el) => {
                  pillRefs.current[idx] = el
                }}
                type="button"
                onClick={() => handleYearClick(idx)}
                aria-current={isActive ? 'location' : undefined}
                className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${isActive
                  ? 'bg-[#159447] text-white border-[#159447] shadow-sm'
                  : 'bg-slate-100 hover:bg-[#159447]/10 hover:text-[#159447] hover:border-[#159447]/30 text-slate-600 border-slate-200'
                  }`}
              >
                {item.period.split(' ')[0]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto relative border-l-2 border-[#159447]/30 ml-3 md:mx-auto md:border-l-2 md:border-[#159447]/30">
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              id={`nomenklatur-${idx}`}
              className="relative pl-5 md:pl-6 group scroll-mt-48"
            >
              <div
                className={`absolute -left-[6px] top-3 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm transition-transform duration-300 ${activeIndex === idx
                  ? 'bg-[#159447] scale-125'
                  : 'bg-[#159447] group-hover:scale-125'
                  }`}
              />

              <div
                className={`relative rounded-xl px-4 py-3 md:px-5 md:py-3.5 border transition-colors duration-300 ${highlightedIndex === idx
                  ? 'bg-[#f0fdf4]/70 border-slate-100 shadow-md'
                  : 'bg-slate-50/80 border-slate-100 shadow-sm hover:shadow-md hover:bg-white'
                  }`}
              >
                {highlightedIndex === idx && (
                  <svg
                    key={`outline-${idx}-${highlightRunId}`}
                    className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                    aria-hidden="true"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      rx="12"
                      ry="12"
                      pathLength={100}
                      fill="none"
                      stroke="#159447"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeDasharray="100"
                      style={{
                        animation: 'traceCardOutline 0.4s ease-out forwards',
                      }}
                    />
                  </svg>
                )}
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <span className="text-xs font-bold text-[#159447] tracking-wider uppercase">
                    {item.period}
                  </span>
                  <div className="inline-block px-2 py-0.5 bg-slate-200/70 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-300/50">
                    {item.badge}
                  </div>
                </div>
                <h4 className="text-base md:text-lg font-bold text-[#172135] mb-1">
                  {item.title}
                </h4>
                <p className="text-[#566276] text-xs md:text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
