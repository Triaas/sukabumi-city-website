import pool from '@/lib/db/pool';
import { leadersList } from '@/data/leadersData';
import { DEFAULT_PROFILE_PAGES } from './defaults';
import {
  isValidProfilePageSlug,
  PROFILE_PAGE_SLUGS,
  type LeaderProfileDetail,
  type ProfilePageData,
  type ProfilePageExtraData,
  type ProfilePageSlug,
} from './types';

interface ProfilePageRow {
  slug: string;
  title: string;
  description: string;
  hero_image: string;
  hero_image_fit: string;
  content_image: string | null;
  content_image_title: string | null;
  content_image_caption: string | null;
  content_html: string;
  extra_data: unknown;
  updated_at: Date | string;
}

function parseExtraData(raw: unknown): ProfilePageExtraData {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object'
        ? (parsed as ProfilePageExtraData)
        : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') {
    return raw as ProfilePageExtraData;
  }
  return {};
}

function mapRowToProfilePage(row: ProfilePageRow): ProfilePageData {
  const slug = row.slug as ProfilePageSlug;
  return {
    slug,
    title: row.title,
    description: row.description ?? '',
    heroImage: row.hero_image ?? '',
    heroImageFit: row.hero_image_fit === 'contain' ? 'contain' : 'cover',
    contentImage: row.content_image ?? null,
    contentImageTitle: row.content_image_title ?? null,
    contentImageCaption: row.content_image_caption ?? null,
    contentHtml: row.content_html ?? '',
    extraData: parseExtraData(row.extra_data),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at ?? ''),
  };
}

async function seedDefaultProfilePage(slug: ProfilePageSlug): Promise<void> {
  const def = DEFAULT_PROFILE_PAGES[slug];
  await pool.query(
    `INSERT INTO public.profile_pages (
      slug,
      title,
      description,
      hero_image,
      hero_image_fit,
      content_image,
      content_image_title,
      content_image_caption,
      content_html,
      extra_data,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
    ON CONFLICT (slug) DO NOTHING`,
    [
      def.slug,
      def.title,
      def.description,
      def.heroImage,
      def.heroImageFit,
      def.contentImage,
      def.contentImageTitle,
      def.contentImageCaption,
      def.contentHtml,
      JSON.stringify(def.extraData ?? {}),
    ]
  );
}

export async function getProfilePageBySlug(
  slug: string
): Promise<ProfilePageData | null> {
  if (!isValidProfilePageSlug(slug)) {
    return null;
  }

  try {
    const { rows } = await pool.query<ProfilePageRow>(
      `SELECT
        slug,
        title,
        description,
        hero_image,
        hero_image_fit,
        content_image,
        content_image_title,
        content_image_caption,
        content_html,
        extra_data,
        updated_at
      FROM public.profile_pages
      WHERE slug = $1`,
      [slug]
    );

    if (rows.length > 0) {
      return mapRowToProfilePage(rows[0]);
    }

    await seedDefaultProfilePage(slug);
    return DEFAULT_PROFILE_PAGES[slug];
  } catch (error) {
    console.error(
      `Error loading profile_pages (${slug}), using default:`,
      error
    );
    return DEFAULT_PROFILE_PAGES[slug];
  }
}

export async function getAllProfilePages(): Promise<ProfilePageData[]> {
  try {
    const { rows } = await pool.query<ProfilePageRow>(
      `SELECT
        slug,
        title,
        description,
        hero_image,
        hero_image_fit,
        content_image,
        content_image_title,
        content_image_caption,
        content_html,
        extra_data,
        updated_at
      FROM public.profile_pages`
    );

    const rowMap = new Map<ProfilePageSlug, ProfilePageData>();
    for (const row of rows) {
      if (isValidProfilePageSlug(row.slug)) {
        rowMap.set(row.slug, mapRowToProfilePage(row));
      }
    }

    const result: ProfilePageData[] = [];
    for (const slug of PROFILE_PAGE_SLUGS) {
      const existing = rowMap.get(slug);
      if (existing) {
        result.push(existing);
      } else {
        try {
          await seedDefaultProfilePage(slug);
        } catch (seedErr) {
          console.error(`Error auto-seeding profile_pages (${slug}):`, seedErr);
        }
        result.push(DEFAULT_PROFILE_PAGES[slug]);
      }
    }

    return result;
  } catch (error) {
    console.error('Error loading all profile_pages, using defaults:', error);
    return PROFILE_PAGE_SLUGS.map((slug) => DEFAULT_PROFILE_PAGES[slug]);
  }
}

export async function getLeaderBySlug(
  leaderSlug: string
): Promise<LeaderProfileDetail | null> {
  const sejarahPage = await getProfilePageBySlug('sejarah');
  const items =
    sejarahPage?.extraData?.leadersData?.items &&
    Array.isArray(sejarahPage.extraData.leadersData.items) &&
    sejarahPage.extraData.leadersData.items.length > 0
      ? sejarahPage.extraData.leadersData.items
      : leadersList;

  const mayor = items.find((l) => l.slug === leaderSlug);
  if (mayor) {
    return {
      slug: mayor.slug,
      name: mayor.name,
      role: mayor.role,
      period: mayor.period,
      image: mayor.image,
      bio: mayor.bio,
      fullBio:
        Array.isArray(mayor.fullBio) && mayor.fullBio.length > 0
          ? mayor.fullBio
          : [mayor.bio],
    };
  }

  const host = items.find((l) => l.deputy?.slug === leaderSlug);
  if (host?.deputy) {
    const deputy = host.deputy;
    return {
      slug: deputy.slug || leaderSlug,
      name: deputy.name,
      role: deputy.role,
      period: host.period,
      image: deputy.image,
      bio: deputy.bio,
      fullBio:
        Array.isArray(deputy.fullBio) && deputy.fullBio.length > 0
          ? deputy.fullBio
          : [deputy.bio],
    };
  }

  return null;
}
