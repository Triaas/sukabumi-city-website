'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db/pool';
import { requireRole } from '@/lib/auth';
import { sanitizeSafeUrl } from '@/lib/security/sanitize';
import { isUploadValidationError, saveSiteAssetImage } from '@/lib/upload';
import {
  DEFAULT_SITE_SETTINGS,
  normalizeYoutubeEmbedUrl,
  orderOpdCategories,
} from './defaults';
import type {
  OpdServiceCard,
  OpdSubItem,
  SiteSectionKey,
  SiteSettingsMap,
} from './types';

function sanitizeOptionalAssetUrl(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return '';
  return sanitizeSafeUrl(raw, {
    allowRelative: true,
    allowHttp: true,
    allowHash: false,
    fallback: '',
  });
}

function sanitizeOptionalLinkUrl(
  raw: string | null | undefined,
  fallback = ''
): string {
  if (!raw || !raw.trim()) return fallback;
  return sanitizeSafeUrl(raw, {
    allowRelative: true,
    allowHttp: true,
    allowHash: true,
    fallback,
  });
}

function sanitizeOpdSubItems(items: OpdSubItem[] | undefined): OpdSubItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((sub) => ({
    ...sub,
    image: sub.image ? sanitizeOptionalAssetUrl(sub.image) : sub.image,
    href: sub.href ? sanitizeOptionalLinkUrl(sub.href, '#') : sub.href,
    subItems: sub.subItems ? sanitizeOpdSubItems(sub.subItems) : undefined,
  }));
}

function sanitizeOpdServiceCards(
  cards: OpdServiceCard[] | undefined
): OpdServiceCard[] {
  if (!Array.isArray(cards)) return [];
  return cards.map((card) => ({
    ...card,
    image: card.image ? sanitizeOptionalAssetUrl(card.image) : card.image,
    href: card.href ? sanitizeOptionalLinkUrl(card.href, '#') : card.href,
    subItems: card.subItems ? sanitizeOpdSubItems(card.subItems) : undefined,
  }));
}

interface SiteSettingRow {
  section_key: string;
  data: unknown;
}

const VALID_SECTION_KEYS: SiteSectionKey[] = [
  'hero',
  'welcome',
  'profile',
  'media',
  'opd',
  'partners',
  'headerFooter',
];

function isValidSectionKey(key: string): key is SiteSectionKey {
  return VALID_SECTION_KEYS.includes(key as SiteSectionKey);
}

function revalidateAllSitePaths(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/admin/pengaturan');
}

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  const merged: SiteSettingsMap = {
    hero: { ...DEFAULT_SITE_SETTINGS.hero },
    welcome: { ...DEFAULT_SITE_SETTINGS.welcome },
    profile: { ...DEFAULT_SITE_SETTINGS.profile },
    media: { ...DEFAULT_SITE_SETTINGS.media },
    opd: { ...DEFAULT_SITE_SETTINGS.opd },
    partners: { ...DEFAULT_SITE_SETTINGS.partners },
    headerFooter: {
      ...DEFAULT_SITE_SETTINGS.headerFooter,
      socialLinks: { ...DEFAULT_SITE_SETTINGS.headerFooter.socialLinks },
      relatedLinks: [...DEFAULT_SITE_SETTINGS.headerFooter.relatedLinks],
    },
  };

  try {
    const { rows } = await pool.query<SiteSettingRow>(
      `SELECT section_key, data FROM public.site_settings`
    );

    for (const row of rows) {
      if (!row || !isValidSectionKey(row.section_key)) continue;
      const rawData =
        typeof row.data === 'string'
          ? JSON.parse(row.data)
          : (row.data as Record<string, unknown>);

      if (!rawData || typeof rawData !== 'object') continue;

      switch (row.section_key) {
        case 'hero': {
          const heroData = rawData as Partial<SiteSettingsMap['hero']>;
          merged.hero = {
            ...DEFAULT_SITE_SETTINGS.hero,
            ...heroData,
            images:
              Array.isArray(heroData.images) && heroData.images.length > 0
                ? heroData.images
                : DEFAULT_SITE_SETTINGS.hero.images,
            slideIntervalMs:
              typeof heroData.slideIntervalMs === 'number' &&
              heroData.slideIntervalMs >= 1000
                ? heroData.slideIntervalMs
                : DEFAULT_SITE_SETTINGS.hero.slideIntervalMs,
          };
          break;
        }
        case 'welcome': {
          const welcomeData = rawData as Partial<SiteSettingsMap['welcome']>;
          merged.welcome = {
            ...DEFAULT_SITE_SETTINGS.welcome,
            ...welcomeData,
          };
          break;
        }
        case 'profile': {
          const profileData = rawData as Partial<SiteSettingsMap['profile']>;
          merged.profile = {
            ...DEFAULT_SITE_SETTINGS.profile,
            ...profileData,
            cards:
              Array.isArray(profileData.cards) && profileData.cards.length > 0
                ? profileData.cards
                : DEFAULT_SITE_SETTINGS.profile.cards,
          };
          break;
        }
        case 'media': {
          const mediaData = rawData as Partial<SiteSettingsMap['media']>;
          merged.media = {
            ...DEFAULT_SITE_SETTINGS.media,
            ...mediaData,
            youtubeEmbedUrl: normalizeYoutubeEmbedUrl(
              mediaData.youtubeEmbedUrl ||
                DEFAULT_SITE_SETTINGS.media.youtubeEmbedUrl
            ),
          };
          break;
        }
        case 'opd': {
          const opdData = rawData as Partial<SiteSettingsMap['opd']>;
          merged.opd = {
            ...DEFAULT_SITE_SETTINGS.opd,
            ...opdData,
            categories:
              opdData.categories &&
              typeof opdData.categories === 'object' &&
              Object.keys(opdData.categories).length > 0
                ? orderOpdCategories(opdData.categories)
                : DEFAULT_SITE_SETTINGS.opd.categories,
          };
          break;
        }
        case 'partners': {
          const partnersData = rawData as Partial<SiteSettingsMap['partners']>;
          merged.partners = {
            ...DEFAULT_SITE_SETTINGS.partners,
            ...partnersData,
            items:
              Array.isArray(partnersData.items) &&
              partnersData.items.length > 0
                ? partnersData.items
                : DEFAULT_SITE_SETTINGS.partners.items,
          };
          break;
        }
        case 'headerFooter': {
          const hfData = rawData as Partial<SiteSettingsMap['headerFooter']>;
          merged.headerFooter = {
            ...DEFAULT_SITE_SETTINGS.headerFooter,
            ...hfData,
            relatedLinks: Array.isArray(hfData.relatedLinks)
              ? hfData.relatedLinks
              : DEFAULT_SITE_SETTINGS.headerFooter.relatedLinks,
            socialLinks: {
              ...DEFAULT_SITE_SETTINGS.headerFooter.socialLinks,
              ...(hfData.socialLinks || {}),
            },
          };
          break;
        }
      }
    }
  } catch (error) {
    console.error('Error loading site_settings, using defaults:', error);
  }

  return merged;
}

export async function updateSiteSectionAction<K extends SiteSectionKey>(
  sectionKey: K,
  payload: SiteSettingsMap[K]
): Promise<{ success: boolean; data?: SiteSettingsMap[K]; error?: string }> {
  await requireRole(['SUPER_ADMIN']);
  try {
    if (!isValidSectionKey(sectionKey)) {
      return { success: false, error: 'Kategori pengaturan tidak valid.' };
    }

    let normalizedPayload = payload;

    switch (sectionKey) {
      case 'hero': {
        const heroPayload = payload as SiteSettingsMap['hero'];
        normalizedPayload = {
          ...heroPayload,
          images: Array.isArray(heroPayload.images)
            ? heroPayload.images
                .map((img) => sanitizeOptionalAssetUrl(img))
                .filter(Boolean)
            : [],
        } as SiteSettingsMap[K];
        break;
      }
      case 'welcome': {
        const welcomePayload = payload as SiteSettingsMap['welcome'];
        normalizedPayload = {
          ...welcomePayload,
          leftContainerImage: sanitizeOptionalAssetUrl(
            welcomePayload.leftContainerImage
          ),
          leaderImage: sanitizeOptionalAssetUrl(welcomePayload.leaderImage),
          sloganImage: sanitizeOptionalAssetUrl(welcomePayload.sloganImage),
        } as SiteSettingsMap[K];
        break;
      }
      case 'profile': {
        const profilePayload = payload as SiteSettingsMap['profile'];
        normalizedPayload = {
          ...profilePayload,
          cards: Array.isArray(profilePayload.cards)
            ? profilePayload.cards.map((card) => ({
                ...card,
                image: sanitizeOptionalAssetUrl(card.image),
                href: sanitizeOptionalLinkUrl(card.href, '#'),
              }))
            : [],
        } as SiteSettingsMap[K];
        break;
      }
      case 'media': {
        const mediaPayload = payload as SiteSettingsMap['media'];
        normalizedPayload = {
          ...mediaPayload,
          youtubeEmbedUrl: normalizeYoutubeEmbedUrl(
            mediaPayload.youtubeEmbedUrl
          ),
          gprPortalUrl: sanitizeSafeUrl(mediaPayload.gprPortalUrl, {
            allowRelative: false,
            allowHttp: true,
            allowHash: false,
            fallback: 'https://www.komdigi.go.id',
          }),
        } as SiteSettingsMap[K];
        break;
      }
      case 'opd': {
        const opdPayload = payload as SiteSettingsMap['opd'];
        const nextCategories: SiteSettingsMap['opd']['categories'] = {};
        for (const [catKey, catVal] of Object.entries(
          opdPayload.categories || {}
        )) {
          nextCategories[catKey] = {
            ...catVal,
            groups: Array.isArray(catVal?.groups)
              ? catVal.groups.map((grp) => ({
                  ...grp,
                  items: sanitizeOpdServiceCards(grp.items),
                }))
              : [],
          };
        }
        normalizedPayload = {
          ...opdPayload,
          categories: nextCategories,
        } as SiteSettingsMap[K];
        break;
      }
      case 'partners': {
        const partnersPayload = payload as SiteSettingsMap['partners'];
        normalizedPayload = {
          ...partnersPayload,
          items: Array.isArray(partnersPayload.items)
            ? partnersPayload.items.map((item) => ({
                ...item,
                image: sanitizeOptionalAssetUrl(item.image),
                href: sanitizeOptionalLinkUrl(item.href, '#'),
              }))
            : [],
        } as SiteSettingsMap[K];
        break;
      }
      case 'headerFooter': {
        const hfPayload = payload as SiteSettingsMap['headerFooter'];
        normalizedPayload = {
          ...hfPayload,
          headerLogoUrl: sanitizeOptionalAssetUrl(hfPayload.headerLogoUrl),
          footerLogoUrl: sanitizeOptionalAssetUrl(hfPayload.footerLogoUrl),
          mapsUrl: sanitizeOptionalLinkUrl(hfPayload.mapsUrl, '#'),
          managedByUrl: sanitizeOptionalLinkUrl(hfPayload.managedByUrl, '#'),
          relatedLinks: Array.isArray(hfPayload.relatedLinks)
            ? hfPayload.relatedLinks.map((link) => ({
                ...link,
                href: sanitizeOptionalLinkUrl(link.href, '#'),
              }))
            : [],
          socialLinks: {
            facebook: sanitizeOptionalLinkUrl(hfPayload.socialLinks?.facebook),
            x: sanitizeOptionalLinkUrl(hfPayload.socialLinks?.x),
            instagram: sanitizeOptionalLinkUrl(
              hfPayload.socialLinks?.instagram
            ),
            youtube: sanitizeOptionalLinkUrl(hfPayload.socialLinks?.youtube),
          },
        } as SiteSettingsMap[K];
        break;
      }
    }

    await pool.query(
      `INSERT INTO public.site_settings (section_key, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (section_key)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [sectionKey, JSON.stringify(normalizedPayload)]
    );

    revalidateAllSitePaths();

    return {
      success: true,
      data: normalizedPayload,
    };
  } catch (error) {
    console.error(`Error in updateSiteSectionAction (${sectionKey}):`, error);
    return {
      success: false,
      error: 'Gagal menyimpan pengaturan beranda.',
    };
  }
}

export async function resetSiteSectionAction<K extends SiteSectionKey>(
  sectionKey: K
): Promise<{ success: boolean; data?: SiteSettingsMap[K]; error?: string }> {
  await requireRole(['SUPER_ADMIN']);
  try {
    if (!isValidSectionKey(sectionKey)) {
      return { success: false, error: 'Kategori pengaturan tidak valid.' };
    }

    const defaultData = DEFAULT_SITE_SETTINGS[sectionKey];

    await pool.query(
      `INSERT INTO public.site_settings (section_key, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (section_key)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [sectionKey, JSON.stringify(defaultData)]
    );

    revalidateAllSitePaths();

    return {
      success: true,
      data: defaultData,
    };
  } catch (error) {
    console.error(`Error in resetSiteSectionAction (${sectionKey}):`, error);
    return {
      success: false,
      error: 'Gagal mereset pengaturan ke bawaan.',
    };
  }
}

export async function uploadSiteImageAction(
  formData: FormData
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  await requireRole(['SUPER_ADMIN']);
  try {
    const fileEntry = formData.get('file');
    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      return {
        success: false,
        error: 'Berkas gambar tidak ditemukan atau kosong.',
      };
    }

    const imageUrl = await saveSiteAssetImage(fileEntry);
    return {
      success: true,
      imageUrl,
    };
  } catch (error) {
    if (isUploadValidationError(error)) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error('Error in uploadSiteImageAction:', error);
    return {
      success: false,
      error: 'Gagal mengunggah berkas gambar.',
    };
  }
}
