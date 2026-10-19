import { NextResponse } from 'next/server';
import { getTransparansiDokumen } from '@/lib/db';

export async function GET() {
  try {
    const dokumen = await getTransparansiDokumen();
    return NextResponse.json(dokumen);
  } catch (error) {
    console.error('API error fetching transparansi dokumen:', error);
    return NextResponse.json([], { status: 500 });
  }
}
