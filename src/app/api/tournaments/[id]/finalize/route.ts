import { NextRequest, NextResponse } from 'next/server';
import { getTournamentById, saveTournament } from '@/lib/tournamentRepo';
import { isTournamentComplete } from '@/lib/gameLogic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await getTournamentById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (tournament.isFinalized) {
      return NextResponse.json(
        { error: 'Tournament already finalized' },
        { status: 400 }
      );
    }

    if (!isTournamentComplete(tournament)) {
      return NextResponse.json(
        { error: 'Tournament is not complete yet' },
        { status: 400 }
      );
    }

    // Finalize
    tournament.isFinalized = true;
    await saveTournament(tournament);

    return NextResponse.json({
      success: true,
      tournament
    });
  } catch (error: any) {
    console.error('Error finalizing tournament:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to finalize tournament' },
      { status: 500 }
    );
  }
}
