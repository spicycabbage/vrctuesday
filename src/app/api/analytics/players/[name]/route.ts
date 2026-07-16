import { NextRequest, NextResponse } from 'next/server';
import { getPlayerDetails } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decoded = decodeURIComponent(name);
    const year = request.nextUrl.searchParams.get('year');
    const player = await getPlayerDetails(year, decoded);

    if (!player) {
      return NextResponse.json(
        { name: decoded, wins: 0, losses: 0, winRate: '0.0', details: [], headToHead: [] },
        { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
      );
    }

    return NextResponse.json(player, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error: any) {
    console.error('Error fetching player details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch player details' },
      { status: 500 }
    );
  }
}
