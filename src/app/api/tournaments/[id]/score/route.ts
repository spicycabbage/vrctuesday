import { NextRequest, NextResponse } from 'next/server';
import { getTournamentById, updateMatchScore } from '@/lib/tournamentRepo';
import { updateMatchScore as updateScore } from '@/lib/gameLogic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { matchId, setNumber, team1Score, team2Score } = body;

    if (!matchId || !setNumber || team1Score === undefined || team2Score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
        { error: 'Cannot update finalized tournament' },
        { status: 400 }
      );
    }

    // Update score in memory
    const updatedTournament = updateScore(
      tournament,
      matchId,
      setNumber,
      team1Score,
      team2Score
    );

    // Find the updated match
    const updatedMatch = updatedTournament.matches.find(m => m.id === matchId);
    if (!updatedMatch) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Only update the specific match and tournament stats (fast!)
    await updateMatchScore(id, updatedMatch, updatedTournament);

    return NextResponse.json({
      success: true,
      tournament: updatedTournament
    });
  } catch (error: any) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update score' },
      { status: 500 }
    );
  }
}
