import { NextRequest, NextResponse } from 'next/server';
import { getTournamentHistory } from '@/lib/tournamentRepo';
import { TournamentFormat } from '@/lib/gameLogic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const formatParam = searchParams.get('format');
    const format: TournamentFormat | 'all' =
      formatParam === '8v8' ? '8v8' : formatParam === '6v6' ? '6v6' : 'all';

    const tournaments = await getTournamentHistory();

    const filteredTournaments = tournaments.filter((t) => {
      if (year && year !== 'all' && !t.date.startsWith(year)) return false;
      if (format !== 'all' && t.format !== format) return false;
      return true;
    });

    return NextResponse.json(filteredTournaments);
  } catch (error: any) {
    console.error('Error fetching tournament history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
