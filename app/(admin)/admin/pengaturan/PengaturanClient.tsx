'use client'

import { useState, useCallback } from 'react'
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
}

const TABS: TabDefinition[] = [
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
    id: 'profile',
    label: 'Profil Kota',
    description: 'Judul section dan kartu profil Kota Sukabumi',
    icon: Landmark,
  },
  {
    id: 'media',
    label: 'Media & GPR',
    description: 'Video profil YouTube & widget GPR Komdigi',
    icon: PlaySquare,
  },
  {
    id: 'opd',
    label: 'Daftar OPD',
    description: 'Kategori, instansi, dan sub-layanan situs OPD',
    icon: Building2,
  },
  {
    id: 'partners',
    label: 'Mitra / Partner',
    description: 'Logo mitra berjalan di bagian bawah beranda',
    icon: Handshake,
  },
  {
    id: 'headerFooter',
    label: 'Header & Footer',
    description: 'Logo instansi, alamat, kontak resmi, & media sosial',
    icon: LayoutTemplate,
  },
]

export default function PengaturanClient({
  initialSettings,
}: {
  initialSettings: SiteSettingsMap
}) {
  const [settings, setSettings] = useState<SiteSettingsMap>(initialSettings)
  const [activeTab, setActiveTab] = useState<ActiveTabId>('hero')
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const showToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      setToast({ type, message })
    },
    []
  )

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
          {TABS.map((tab) => {
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
      </div>

      {/* Konten Tab Aktif */}
      <div role="tabpanel">
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
