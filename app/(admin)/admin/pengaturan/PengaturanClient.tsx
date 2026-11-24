'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Sparkles,
  Image as ImageIcon,
  PlaySquare,
  LayoutTemplate,
  Landmark,
  Building2,
  Handshake,
} from 'lucide-react'
import type { SiteSettingsMap } from '@/lib/site-settings/types'
import ToastNotification from '@/components/ToastNotification'
import HeroTab from './tabs/HeroTab'
import WelcomeTab from './tabs/WelcomeTab'
import ProfileTab from './tabs/ProfileTab'
import MediaTab from './tabs/MediaTab'
import OpdTab from './tabs/OpdTab'
import PartnersTab from './tabs/PartnersTab'
import HeaderFooterTab from './tabs/HeaderFooterTab'

type ActiveTabId =
  | 'hero'
  | 'welcome'
  | 'profile'
  | 'media'
  | 'opd'
  | 'partners'
  | 'headerFooter'

interface TabDefinition {
  id: ActiveTabId
  label: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  row: 'primary' | 'secondary'
}

const TABS: TabDefinition[] = [
  {
    id: 'hero',
    label: 'Hero Section',
    description: 'Teks sambutan utama & foto slider latar belakang',
    icon: Sparkles,
    row: 'primary',
  },
  {
    id: 'welcome',
    label: 'Welcome (Foto)',
    description: 'Foto kontainer kiri, Wali Kota & Wakil, serta logo IMAN',
    icon: ImageIcon,
    row: 'primary',
  },
  {
    id: 'profile',
    label: 'Profil Kota',
    description: 'Judul section dan kartu profil Kota Sukabumi',
    icon: Landmark,
    row: 'primary',
  },
  {
    id: 'media',
    label: 'Media & GPR',
    description: 'Video profil YouTube & widget GPR Komdigi',
    icon: PlaySquare,
    row: 'primary',
  },
  {
    id: 'opd',
    label: 'Daftar OPD',
    description: 'Kategori, instansi, dan sub-layanan situs OPD',
    icon: Building2,
    row: 'secondary',
  },
  {
    id: 'partners',
    label: 'Mitra / Partner',
    description: 'Logo mitra berjalan di bagian bawah beranda',
    icon: Handshake,
    row: 'secondary',
  },
  {
    id: 'headerFooter',
    label: 'Header & Footer',
    description: 'Logo instansi, alamat, kontak resmi, & media sosial',
    icon: LayoutTemplate,
    row: 'secondary',
  },
]

export default function PengaturanClient({
  initialSettings,
  initialTab,
}: {
  initialSettings: SiteSettingsMap
  initialTab?: string
}) {
  const validTabs: ActiveTabId[] = [
    'hero',
    'welcome',
    'profile',
    'media',
    'opd',
    'partners',
    'headerFooter',
  ]
  const resolvedInitialTab: ActiveTabId = validTabs.includes(
    initialTab as ActiveTabId
  )
    ? (initialTab as ActiveTabId)
    : 'hero'

  const [settings, setSettings] = useState<SiteSettingsMap>(initialSettings)
  const [activeTab, setActiveTab] = useState<ActiveTabId>(resolvedInitialTab)
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const tabRefs = useRef<Partial<Record<ActiveTabId, HTMLButtonElement | null>>>({})

  const showToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      setToast({ type, message })
    },
    []
  )

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % TABS.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = TABS.length - 1
    }

    if (nextIndex !== null) {
      e.preventDefault()
      const nextTab = TABS[nextIndex]
      setActiveTab(nextTab.id)
      tabRefs.current[nextTab.id]?.focus()
    }
  }

  const primaryTabs = TABS.filter((tab) => tab.row === 'primary')
  const secondaryTabs = TABS.filter((tab) => tab.row === 'secondary')

  const renderTabButton = (tab: TabDefinition, orderIndex: number) => {
    const Icon = tab.icon
    const isSelected = activeTab === tab.id
    return (
      <button
        key={tab.id}
        ref={(el) => {
          tabRefs.current[tab.id] = el
        }}
        id={`tab-${tab.id}`}
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={`panel-${tab.id}`}
        tabIndex={isSelected ? 0 : -1}
        onClick={() => setActiveTab(tab.id)}
        onKeyDown={(e) => handleTabKeyDown(e, orderIndex)}
        className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159447] focus-visible:ring-offset-2 ${
          isSelected
            ? 'border-[#159447] bg-[#159447] text-white shadow-sm'
            : 'border-slate-200 bg-slate-50/70 text-[#172135] hover:border-[#159447]/45 hover:bg-white'
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isSelected
              ? 'bg-white/15 text-white'
              : 'bg-white text-[#159447] border border-slate-200/90'
          }`}
        >
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold leading-snug truncate">
              {tab.label}
            </span>
            <span
              className={`text-[11px] font-semibold tabular-nums shrink-0 ${
                isSelected ? 'text-white/90' : 'text-[#566276]'
              }`}
            >
              {String(orderIndex + 1).padStart(2, '0')}
            </span>
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
  }

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
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-sm">
        <div
          role="tablist"
          aria-label="Kategori Pengaturan Beranda"
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {primaryTabs.map((tab, idx) => renderTabButton(tab, idx))}
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {secondaryTabs.map((tab, idx) =>
                renderTabButton(tab, primaryTabs.length + idx)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Konten Tab Aktif */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'profile' && (
          <ProfileTab
            initialData={settings.profile}
            onSaved={(newProfile) =>
              setSettings((prev) => ({ ...prev, profile: newProfile }))
            }
            onNotify={showToast}
          />
        )}

        {activeTab === 'opd' && (
          <OpdTab
            initialData={settings.opd}
            onSaved={(newOpd) =>
              setSettings((prev) => ({ ...prev, opd: newOpd }))
            }
            onNotify={showToast}
          />
        )}

        {activeTab === 'partners' && (
          <PartnersTab
            initialData={settings.partners}
            onSaved={(newPartners) =>
              setSettings((prev) => ({ ...prev, partners: newPartners }))
            }
            onNotify={showToast}
          />
        )}

        {activeTab === 'hero' && (
          <HeroTab
            initialData={settings.hero}
            onSaved={(newHero) =>
              setSettings((prev) => ({ ...prev, hero: newHero }))
            }
            onNotify={showToast}
          />
        )}

        {activeTab === 'welcome' && (
          <WelcomeTab
            initialData={settings.welcome}
            onSaved={(newWelcome) =>
              setSettings((prev) => ({ ...prev, welcome: newWelcome }))
            }
            onNotify={showToast}
          />
        )}

        {activeTab === 'media' && (
          <MediaTab
            initialData={settings.media}
            onSaved={(newMedia) =>
              setSettings((prev) => ({ ...prev, media: newMedia }))
            }
            onNotify={showToast}
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
            onNotify={showToast}
          />
        )}
      </div>

      <ToastNotification
        message={toast?.message}
        type={toast?.type}
        duration={3500}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
