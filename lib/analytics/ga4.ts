import { BetaAnalyticsDataClient } from '@google-analytics/data';

export type AnalyticsRange = '7d' | '30d' | '1y';

export interface VisitorChartPoint {
  date: string;
  day: string;
  visitors: number;
}

export interface VisitorChartSeries {
  total: string;
  avg: string;
  max: number;
  points: VisitorChartPoint[];
}

export interface PopularNewsItem {
  title: string;
  path?: string;
  views: string;
  rawViews: number;
}

export interface DashboardAnalyticsData {
  isConfigured: boolean;
  monthlyVisitors: number;
  chartData: Record<AnalyticsRange, VisitorChartSeries>;
  popularNews: PopularNewsItem[];
}

interface Ga4Config {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
}

const MONTH_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

const DAY_NAME_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

function getGa4Config(): Ga4Config | null {
  const propertyId = process.env.GA_PROPERTY_ID?.trim();
  const clientEmail = process.env.GA_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.GA_PRIVATE_KEY?.trim();

  if (!propertyId || !clientEmail || !rawPrivateKey) {
    return null;
  }

  // Abaikan nilai placeholder bawaan dari .env.example
  if (
    propertyId === '123456789' ||
    clientEmail.includes('your-gcp-project') ||
    rawPrivateKey.includes('...')
  ) {
    return null;
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  return {
    propertyId,
    clientEmail,
    privateKey,
  };
}

export function getFallbackDashboardAnalytics(): DashboardAnalyticsData {
  return {
    isConfigured: false,
    monthlyVisitors: 1089,
    chartData: {
      '7d': {
        total: '13.440',
        avg: '1.920 / hari',
        max: 3000,
        points: [
          { date: '21 Okt', day: 'Senin', visitors: 1450 },
          { date: '22 Okt', day: 'Selasa', visitors: 2120 },
          { date: '23 Okt', day: 'Rabu', visitors: 1680 },
          { date: '24 Okt', day: 'Kamis', visitors: 2740 },
          { date: '25 Okt', day: 'Jumat', visitors: 2310 },
          { date: '26 Okt', day: 'Sabtu', visitors: 1250 },
          { date: '27 Okt', day: 'Minggu', visitors: 1890 },
        ],
      },
      '30d': {
        total: '54.200',
        avg: '1.806 / hari',
        max: 12000,
        points: [
          { date: '1 Okt', day: 'Pekan 1', visitors: 6500 },
          { date: '5 Okt', day: 'Pekan 1', visitors: 7200 },
          { date: '10 Okt', day: 'Pekan 2', visitors: 8100 },
          { date: '15 Okt', day: 'Pekan 3', visitors: 9500 },
          { date: '20 Okt', day: 'Pekan 3', visitors: 8800 },
          { date: '25 Okt', day: 'Pekan 4', visitors: 10200 },
          { date: '27 Okt', day: 'Hari Ini', visitors: 3900 },
        ],
      },
      '1y': {
        total: '652.800',
        avg: '1.789 / hari',
        max: 100000,
        points: [
          { date: 'Jan', day: '2026', visitors: 45000 },
          { date: 'Mar', day: '2026', visitors: 58000 },
          { date: 'Mei', day: '2026', visitors: 62000 },
          { date: 'Jul', day: '2026', visitors: 71000 },
          { date: 'Sep', day: '2026', visitors: 85000 },
          { date: 'Okt', day: '2026', visitors: 54200 },
          { date: 'Des', day: 'Proyeksi', visitors: 90000 },
        ],
      },
    },
    popularNews: [
      {
        title: 'Pemkot Sukabumi Luncurkan Layanan Perizinan Digital Terpadu',
        views: '1.200x dilihat',
        rawViews: 1200,
      },
      {
        title: 'Wali Kota Sukabumi Resmikan Revitalisasi Alun-Alun Kota',
        views: '980x dilihat',
        rawViews: 980,
      },
      {
        title: 'Dishub Benahi Tata Kelola Parkir Untuk Mendukung Peningkatan PAD',
        views: '845x dilihat',
        rawViews: 845,
      },
      {
        title:
          'Peringatan Harhubnas Merupakan Momentum Untuk Memperkuat Peran Transportasi',
        views: '710x dilihat',
        rawViews: 710,
      },
      {
        title:
          'Pendaftaran Seleksi Calon Dewas dan Direksi BPR Kota Sukabumi Dibuka',
        views: '655x dilihat',
        rawViews: 655,
      },
    ],
  };
}

function parseGaDate(yyyymmdd: string): Date | null {
  if (!/^\d{8}$/.test(yyyymmdd)) return null;
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  return new Date(Date.UTC(year, month, day));
}

function formatNiceMax(maxValue: number): number {
  if (maxValue <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalized = maxValue / magnitude;
  if (normalized <= 1.2) return Math.ceil(1.2 * magnitude);
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function buildSeries(
  points: VisitorChartPoint[],
  divisorDays: number,
  fallbackSeries: VisitorChartSeries
): VisitorChartSeries {
  if (points.length < 2) {
    return fallbackSeries;
  }

  const totalNum = points.reduce((sum, pt) => sum + pt.visitors, 0);
  const avgNum = Math.round(totalNum / Math.max(1, divisorDays));
  const maxPoint = Math.max(...points.map((pt) => pt.visitors));

  return {
    total: totalNum.toLocaleString('id-ID'),
    avg: `${avgNum.toLocaleString('id-ID')} / hari`,
    max: formatNiceMax(maxPoint),
    points,
  };
}

function compressDailyPointsToBuckets(
  dailyPoints: VisitorChartPoint[],
  targetBuckets = 7
): VisitorChartPoint[] {
  if (dailyPoints.length <= targetBuckets) {
    return dailyPoints;
  }

  const bucketSize = Math.ceil(dailyPoints.length / targetBuckets);
  const buckets: VisitorChartPoint[] = [];

  for (let i = 0; i < dailyPoints.length; i += bucketSize) {
    const slice = dailyPoints.slice(i, i + bucketSize);
    const last = slice[slice.length - 1];
    const sum = slice.reduce((acc, item) => acc + item.visitors, 0);
    buckets.push({
      date: last.date,
      day: `Pekan ${Math.min(4, Math.floor(i / 7) + 1)}`,
      visitors: sum,
    });
  }

  return buckets;
}

function cleanNewsTitle(pageTitle: string, pagePath: string): string {
  const cleaned = pageTitle
    .replace(/\s*\|\s*Pemerintah Kota Sukabumi.*$/i, '')
    .trim();
  if (cleaned) return cleaned;

  const slug = pagePath.replace(/^\/berita\//, '').replace(/\/$/, '');
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function getDashboardAnalytics(): Promise<DashboardAnalyticsData> {
  const fallback = getFallbackDashboardAnalytics();
  const config = getGa4Config();

  if (!config) {
    return fallback;
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: config.clientEmail,
        private_key: config.privateKey,
      },
    });

    const property = `properties/${config.propertyId}`;

    const [
      [monthlyRes],
      [trend7dRes],
      [trend30dRes],
      [trend1yRes],
      [popularNewsRes],
    ] = await Promise.all([
      client.runReport({
        property,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: '6daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'yearMonth' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'BEGINS_WITH',
              value: '/berita/',
            },
          },
        },
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      }),
    ]);

    const monthlyVisitors = Number(
      monthlyRes.rows?.[0]?.metricValues?.[0]?.value ?? 0
    );

    const points7d: VisitorChartPoint[] = (trend7dRes.rows ?? []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? '';
      const parsed = parseGaDate(rawDate);
      const visitors = Number(row.metricValues?.[0]?.value ?? 0);
      return {
        date: parsed
          ? `${parsed.getUTCDate()} ${MONTH_SHORT_ID[parsed.getUTCMonth()]}`
          : rawDate,
        day: parsed ? DAY_NAME_ID[parsed.getUTCDay()] : '',
        visitors,
      };
    });

    const rawPoints30d: VisitorChartPoint[] = (trend30dRes.rows ?? []).map(
      (row) => {
        const rawDate = row.dimensionValues?.[0]?.value ?? '';
        const parsed = parseGaDate(rawDate);
        const visitors = Number(row.metricValues?.[0]?.value ?? 0);
        return {
          date: parsed
            ? `${parsed.getUTCDate()} ${MONTH_SHORT_ID[parsed.getUTCMonth()]}`
            : rawDate,
          day: parsed ? DAY_NAME_ID[parsed.getUTCDay()] : '',
          visitors,
        };
      }
    );

    const points1y: VisitorChartPoint[] = (trend1yRes.rows ?? []).map((row) => {
      const ym = row.dimensionValues?.[0]?.value ?? '';
      const year = ym.slice(0, 4);
      const monthIdx = Number(ym.slice(4, 6)) - 1;
      const visitors = Number(row.metricValues?.[0]?.value ?? 0);
      return {
        date: MONTH_SHORT_ID[monthIdx] ?? ym,
        day: year,
        visitors,
      };
    });

    const popularNews: PopularNewsItem[] = (popularNewsRes.rows ?? [])
      .map((row) => {
        const pagePath = row.dimensionValues?.[0]?.value ?? '';
        const pageTitle = row.dimensionValues?.[1]?.value ?? '';
        const rawViews = Number(row.metricValues?.[0]?.value ?? 0);
        return {
          title: cleanNewsTitle(pageTitle, pagePath),
          path: pagePath,
          views: `${rawViews.toLocaleString('id-ID')}x dilihat`,
          rawViews,
        };
      })
      .filter((item) => Boolean(item.title));

    return {
      isConfigured: true,
      monthlyVisitors,
      chartData: {
        '7d': buildSeries(points7d, 7, fallback.chartData['7d']),
        '30d': buildSeries(
          compressDailyPointsToBuckets(rawPoints30d, 7),
          30,
          fallback.chartData['30d']
        ),
        '1y': buildSeries(points1y, 365, fallback.chartData['1y']),
      },
      popularNews: popularNews.length > 0 ? popularNews : fallback.popularNews,
    };
  } catch (error) {
    console.error('[GA4] Gagal mengambil data analitik, menggunakan fallback:', error);
    return fallback;
  }
}
