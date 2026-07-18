import { NextRequest, NextResponse } from 'next/server';
import { getTournamentById, saveTournament } from '@/lib/tournamentRepo';
import { isTournamentComplete, syncTournamentMatches } from '@/lib/gameLogic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const loaded = await getTournamentById(id);

    if (!loaded) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (loaded.isFinalized) {
      return NextResponse.json(
        { error: 'Tournament already finalized' },
        { status: 400 }
      );
    }

    // Repair 8v8 matches that have set1 scored but completed=false (pre-fix)
    const tournament = syncTournamentMatches({
      ...loaded,
      matches: loaded.matches.map((m) => ({ ...m })),
    });

    if (!isTournamentComplete(tournament)) {
      return NextResponse.json(
        { error: 'Tournament is not complete yet — every match needs a score' },
        { status: 400 }
      );
    }

    tournament.isFinalized = true;
    await saveTournament(tournament);

    return NextResponse.json({
      success: true,
      tournament,
    });
  } catch (error: any) {
    console.error('Error finalizing tournament:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to finalize tournament' },
      { status: 500 }
    );
  }
}
