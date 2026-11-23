export type SiteSectionKey =
  | 'hero'
  | 'welcome'
  | 'profile'
  | 'media'
  | 'opd'
  | 'partners'
  | 'headerFooter';

export interface HeroSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
  images: string[];
  slideIntervalMs: number;
}

export interface WelcomeSettings {
  leftContainerImage: string;
  leftContainerAlt: string;
  leaderImage: string;
  leaderAlt: string;
  sloganImage: string;
  sloganAlt: string;
}

export interface ProfileCardItem {
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface ProfileSettings {
  heading: string;
  subtitle: string;
  cards: ProfileCardItem[];
}

export interface MediaSettings {
  youtubeEmbedUrl: string;
  youtubeTitle: string;
  gprTitle: string;
  gprSubtitle: string;
  gprPortalUrl: string;
}

export interface OpdSubItem {
  id: string;
  image?: string;
  title: string;
  subtitle: string;
  href?: string;
  subItems?: OpdSubItem[];
}

export interface OpdServiceCard {
  id: string;
  image?: string;
  title: string;
  subtitle: string;
  href?: string;
  subItems?: OpdSubItem[];
}

export interface OpdServiceGroup {
  title: string;
  items: OpdServiceCard[];
}

export interface OpdCategory {
  groups: OpdServiceGroup[];
}

export interface OpdSettings {
  heading: string;
  subtitle: string;
  categories: Record<string, OpdCategory>;
}

export interface PartnerItem {
  id: number;
  image: string;
  href: string;
  alt?: string;
}

export interface PartnersSettings {
  items: PartnerItem[];
}

export interface RelatedLinkItem {
  label: string;
  href: string;
}

export interface SocialLinksSettings {
  facebook: string;
  x: string;
  instagram: string;
  youtube: string;
}

export interface HeaderFooterSettings {
  headerLogoUrl: string;
  footerLogoUrl: string;
  topLabel: string;
  orgName: string;
  mottoText: string;
  footerDescription: string;
  addressText: string;
  mapsUrl: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  relatedLinks: RelatedLinkItem[];
  socialLinks: SocialLinksSettings;
  copyrightText: string;
  managedByLabel: string;
  managedByUrl: string;
}

export interface SiteSettingsMap {
  hero: HeroSettings;
  welcome: WelcomeSettings;
  profile: ProfileSettings;
  media: MediaSettings;
  opd: OpdSettings;
  partners: PartnersSettings;
  headerFooter: HeaderFooterSettings;
}
