import { NextResponse } from 'next/server';
import { getEventBanners } from '@/lib/db';

export async function GET() {
  try {
    const banners = await getEventBanners();
    return NextResponse.json(banners);
  } catch (error) {
    console.error('API error fetching event banners:', error);
    return NextResponse.json([], { status: 500 });
  }
}
