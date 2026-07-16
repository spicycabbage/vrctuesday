import { NextRequest, NextResponse } from 'next/server';
import { getPlayerSummaries } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const year = request.nextUrl.searchParams.get('year');
    const summaries = await getPlayerSummaries(year);
    return NextResponse.json(summaries, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error: any) {
    console.error('Error fetching player analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
