import { NextRequest, NextResponse } from 'next/server';
import { createTournament } from '@/lib/gameLogic';
import { saveTournament, getActiveTournament } from '@/lib/tournamentRepo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessCode, team1Name, team2Name, team1Players, team2Players } = body;

    // Check if there's already an active tournament
    const activeTournament = await getActiveTournament();
    if (activeTournament) {
      return NextResponse.json(
        { error: 'An active tournament already exists. Please finalize it before creating a new one.' },
        { status: 400 }
      );
    }

    // Validation
    if (!accessCode || !team1Name || !team2Name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(team1Players) || team1Players.length !== 6) {
      return NextResponse.json(
        { error: 'Team 1 must have exactly 6 players' },
        { status: 400 }
      );
    }

    if (!Array.isArray(team2Players) || team2Players.length !== 6) {
      return NextResponse.json(
        { error: 'Team 2 must have exactly 6 players' },
        { status: 400 }
      );
    }

    // Create tournament
    const tournament = createTournament(
      accessCode,
      team1Name,
      team2Name,
      team1Players,
      team2Players
    );

    // Save to database
    await saveTournament(tournament);

    return NextResponse.json({
      success: true,
      tournamentId: tournament.id
    });
  } catch (error: any) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create tournament' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tournament = await getActiveTournament();
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'No active tournament found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error: any) {
    console.error('Error fetching active tournament:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}
