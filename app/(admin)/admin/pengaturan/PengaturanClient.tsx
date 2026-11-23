'use client'

import { useState } from 'react'
import {
  Sparkles,
  Image as ImageIcon,
  PlaySquare,
  LayoutTemplate,
  Lock,
} from 'lucide-react'
import type { SiteSettingsMap } from '@/lib/site-settings/types'
import HeroTab from './tabs/HeroTab'
import WelcomeTab from './tabs/WelcomeTab'
import MediaTab from './tabs/MediaTab'
import HeaderFooterTab from './tabs/HeaderFooterTab'

type ActiveTabId = 'hero' | 'welcome' | 'media' | 'headerFooter'

interface TabDefinition {
  id: ActiveTabId
  label: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const PHASE1_TABS: TabDefinition[] = [
  {
    id: 'hero',
    label: 'Hero Section',
    description: 'Teks sambutan utama & foto slider latar belakang',
    icon: Sparkles,
  },
  {
    id: 'welcome',
    label: 'Welcome (Foto)',
    description: 'Foto kontainer kiri, Wali Kota & Wakil, serta logo IMAN',
    icon: ImageIcon,
  },
  {
    id: 'media',
    label: 'Media & GPR',
    description: 'Video profil YouTube & widget GPR Komdigi',
    icon: PlaySquare,
  },
  {
    id: 'headerFooter',
    label: 'Header & Footer',
    description: 'Logo instansi, alamat, kontak resmi, & media sosial',
    icon: LayoutTemplate,
  },
]

const UPCOMING_TABS = [
  'Profil Kota (Fase 2)',
  'Daftar OPD (Fase 2)',
  'Mitra / Partner (Fase 2)',
]

export default function PengaturanClient({
  initialSettings,
}: {
  initialSettings: SiteSettingsMap
}) {
  const [settings, setSettings] = useState<SiteSettingsMap>(initialSettings)
  const [activeTab, setActiveTab] = useState<ActiveTabId>('hero')

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172135] tracking-tight">
            Pengaturan Beranda Pengunjung
          </h1>
          <p className="mt-1 text-sm text-[#566276] leading-relaxed">
            Kelola konten halaman utama, foto pimpinan, tautan video, serta identitas Header dan Footer tanpa mengubah kode.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#172135] shadow-sm hover:border-[#159447] hover:text-[#159447] transition-colors shrink-0 min-h-[44px]"
        >
          Lihat Halaman Pengunjung
        </a>
      </div>

      {/* Navigasi Tab */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div
          role="tablist"
          aria-label="Kategori Pengaturan Beranda"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
        >
          {PHASE1_TABS.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-start gap-3 rounded-xl p-3.5 text-left transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-[#159447] text-white shadow-sm'
                    : 'bg-slate-50/70 text-[#172135] hover:bg-slate-100'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isSelected
                      ? 'bg-white/15 text-white'
                      : 'bg-white text-[#159447] border border-slate-200/80'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-snug">
                    {tab.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs leading-snug line-clamp-2 ${
                      isSelected ? 'text-white/85' : 'text-[#566276]'
                    }`}
                  >
                    {tab.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Indikator Tab Fase 2 */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 px-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Segera Hadir:
          </span>
          {UPCOMING_TABS.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500"
            >
              <Lock size={12} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Konten Tab Aktif */}
      <div role="tabpanel">
        {activeTab === 'hero' && (
          <HeroTab
            initialData={settings.hero}
            onSaved={(newHero) =>
              setSettings((prev) => ({ ...prev, hero: newHero }))
            }
          />
        )}

        {activeTab === 'welcome' && (
          <WelcomeTab
            initialData={settings.welcome}
            onSaved={(newWelcome) =>
              setSettings((prev) => ({ ...prev, welcome: newWelcome }))
            }
          />
        )}

        {activeTab === 'media' && (
          <MediaTab
            initialData={settings.media}
            onSaved={(newMedia) =>
              setSettings((prev) => ({ ...prev, media: newMedia }))
            }
          />
        )}

        {activeTab === 'headerFooter' && (
          <HeaderFooterTab
            initialData={settings.headerFooter}
            onSaved={(newHeaderFooter) =>
              setSettings((prev) => ({
                ...prev,
                headerFooter: newHeaderFooter,
              }))
            }
          />
        )}
      </div>
    </div>
  )
}
