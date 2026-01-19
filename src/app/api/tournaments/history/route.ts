import { NextRequest, NextResponse } from 'next/server';
import { getTournamentHistory } from '@/lib/tournamentRepo';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    
    const tournaments = await getTournamentHistory();
    
    // Filter by year if provided and not "all"
    const filteredTournaments = (year && year !== 'all')
      ? tournaments.filter(t => t.date.startsWith(year))
      : tournaments;
    
    return NextResponse.json(filteredTournaments);
  } catch (error: any) {
    console.error('Error fetching tournament history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
