import type { DeputyLeader, Leader } from '@/data/leadersData';

export type { DeputyLeader, Leader };

export type ProfilePageSlug =
  | 'sejarah'
  | 'visi-misi'
  | 'lambang'
  | 'geografi'
  | 'sosial-ekonomi'
  | 'dalam-angka'
  | 'uks';

export const PROFILE_PAGE_SLUGS: ProfilePageSlug[] = [
  'sejarah',
  'visi-misi',
  'lambang',
  'geografi',
  'sosial-ekonomi',
  'dalam-angka',
  'uks',
];

export function isValidProfilePageSlug(slug: string): slug is ProfilePageSlug {
  return PROFILE_PAGE_SLUGS.includes(slug as ProfilePageSlug);
}

export interface QuickLinkItem {
  label: string;
  targetId: string;
}

export interface TimelineItem {
  period: string;
  title: string;
  badge: string;
  description: string;
}

export interface TimelineData {
  title: string;
  items: TimelineItem[];
}

export interface LeadersData {
  title: string;
  items: Leader[];
}

export interface MeaningItem {
  title: string;
  desc: string;
  image?: string;
}

export interface FeaturedPublication {
  src: string;
  caption?: string;
  title?: string;
  subtitle?: string;
  link?: string;
  imageClassName?: string;
}

export interface ProfilePageExtraData {
  contentImageClassName?: string;
  quickLinks?: QuickLinkItem[];
  timelineData?: TimelineData;
  leadersData?: LeadersData;
  meaningItems?: MeaningItem[];
  featuredPublication?: FeaturedPublication;
}

export interface ProfilePageData {
  slug: ProfilePageSlug;
  title: string;
  description: string;
  heroImage: string;
  heroImageFit: 'cover' | 'contain';
  contentImage: string | null;
  contentImageTitle: string | null;
  contentImageCaption: string | null;
  contentHtml: string;
  extraData: ProfilePageExtraData;
  updatedAt?: string;
}

export interface ProfilePageUpdatePayload {
  title: string;
  description: string;
  heroImage: string;
  heroImageFit: 'cover' | 'contain';
  contentImage?: string | null;
  contentImageTitle?: string | null;
  contentImageCaption?: string | null;
  contentHtml: string;
  extraData?: ProfilePageExtraData;
}

export interface LeaderProfileDetail {
  slug: string;
  name: string;
  role: string;
  period: string;
  image: string;
  bio: string;
  fullBio: string[];
}
