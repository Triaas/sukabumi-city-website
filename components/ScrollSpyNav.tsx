'use client'

import { useState, useEffect } from 'react'

export default function ScrollSpyNav({ links }: { links: Array<{label: string, targetId: string}> }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!links || links.length === 0) return;
    
    setActiveId(links[0].targetId);

    const handleScroll = () => {
      let current = links[0].targetId;
      for (const link of links) {
        const el = document.getElementById(link.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            current = link.targetId;
          }
        }
      }
      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [links]);

  const handleClick = (targetId: string) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!links || links.length === 0) return null;

  return (
    <>
      {/* Tampilan Mobile: Swipeable Pills */}
      <div className="xl:hidden sticky top-[80px] md:top-[90px] z-40 bg-white/90 backdrop-blur-md -mx-4 px-4 py-3 border-b border-slate-200/80 mb-6 shadow-sm overflow-x-auto hide-scrollbar">
        <div className="flex flex-nowrap gap-2 w-max">
          {links.map((link) => (
            <button
              key={link.targetId}
              onClick={() => handleClick(link.targetId)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-full transition-all shadow-sm ${
                activeId === link.targetId
                  ? 'bg-[#159447] text-white'
                  : 'bg-[#f0fdf4] text-[#159447] border border-[#159447]/20 hover:bg-green-100'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tampilan Desktop: Sidebar Absolute Mungil di Kiri */}
      <div className="hidden xl:block absolute left-0 top-0 bottom-0 w-max z-30">
        <div className="sticky top-32 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-4">
          <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-2">Daftar Isi</h4>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <button
                key={link.targetId}
                onClick={() => handleClick(link.targetId)}
                className={`text-left whitespace-nowrap px-3 py-2.5 rounded-lg transition-all text-sm font-bold border-l-[3px] ${
                  activeId === link.targetId
                    ? 'bg-[#f0fdf4] text-[#159447] border-[#159447]'
                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
