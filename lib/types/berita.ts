export type NewsStatus = 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN_BERITA' | 'REPORTER';

/**
 * Mengembalikan label bahasa Indonesia untuk status berita
 * berdasarkan peran pengguna yang sedang melihat.
 */
export function getStatusLabel(status: NewsStatus, role?: UserRole): string {
  switch (status) {
    case 'DRAFT':
      return 'Draf';
    case 'SUBMITTED':
      return role === 'REPORTER' ? 'Diserahkan' : 'Perlu Peninjauan';
    case 'PUBLISHED':
      return 'Diterbitkan';
    default:
      return status;
  }
}

/**
 * Pemetaan kelas warna badge Tailwind CSS sesuai status berita.
 */
export const STATUS_COLORS: Record<
  NewsStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  DRAFT: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  SUBMITTED: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  PUBLISHED: {
    bg: 'bg-green-50',
    text: 'text-[#159447]',
    border: 'border-green-200',
    dot: 'bg-[#159447]',
  },
};

/**
 * Struktur data berita untuk sisi publik (Landing Page & /berita).
 * Kompatibel dengan BeritaClient.tsx dan komponen kartu berita di app/(public)/page.tsx.
 */
export interface BeritaPublic {
  title: string;
  slug: string;
  category: string;
  date: string;
  image?: string;
}

/**
 * Struktur detail berita lengkap untuk halaman /berita/[slug].
 */
export interface BeritaDetailPublic {
  title: string;
  content: string;
  date: string;
  image?: string | null;
  author: string;
  categories: string[];
  caption?: string | null;
  sourceCredit?: string | null;
}

/**
 * Struktur baris data berita untuk tabel manajemen di panel Admin & Reporter.
 */
export interface BeritaAdminRow {
  id: number | string;
  no?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image: string | null;
  image_url: string | null;
  caption?: string | null;
  sourceCredit?: string | null;
  categoryId?: number | null;
  categoryName: string;
  category_name: string;
  categories: string[];
  authorName: string;
  author_name: string;
  status: NewsStatus;
  publishedAt: string | null;
  published_at: string | null;
  createdAt: string;
  created_at: string;
  updatedAt: string;
}

/**
 * Struktur data naskah tunggal untuk pre-fill form Edit Berita.
 */
export interface BeritaEditData {
  id: number;
  title: string;
  slug: string;
  content: string;
  category_id: number | null;
  category_name: string;
  image_url: string | null;
  caption: string | null;
  source_credit: string | null;
  author_name: string;
  author_role: UserRole;
  status: NewsStatus;
  published_at: string | null;
}
