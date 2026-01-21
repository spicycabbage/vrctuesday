import { NextRequest, NextResponse } from 'next/server';
import { createTournament } from '@/lib/gameLogic';
import { saveTournament, getActiveTournament } from '@/lib/tournamentRepo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessCode, team1Name, team2Name, team1Players, team2Players, date } = body;

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

    // Validate all player names are filled and not empty/whitespace
    for (let i = 0; i < 6; i++) {
      if (!team1Players[i] || typeof team1Players[i] !== 'string' || !team1Players[i].trim()) {
        return NextResponse.json(
          { error: `Team 1 player ${i + 1} name is required` },
          { status: 400 }
        );
      }
      if (!team2Players[i] || typeof team2Players[i] !== 'string' || !team2Players[i].trim()) {
        return NextResponse.json(
          { error: `Team 2 player ${i + 1} name is required` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate names within each team
    const team1Names = team1Players.map((p: string) => p.trim().toLowerCase());
    const team2Names = team2Players.map((p: string) => p.trim().toLowerCase());
    
    if (new Set(team1Names).size !== team1Names.length) {
      return NextResponse.json(
        { error: 'Team 1 has duplicate player names' },
        { status: 400 }
      );
    }
    
    if (new Set(team2Names).size !== team2Names.length) {
      return NextResponse.json(
        { error: 'Team 2 has duplicate player names' },
        { status: 400 }
      );
    }

    // Check for same player on both teams
    const duplicateAcrossTeams = team1Names.find(name => team2Names.includes(name));
    if (duplicateAcrossTeams) {
      return NextResponse.json(
        { error: 'A player cannot be on both teams' },
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

    // Set the date if provided
    if (date) {
      tournament.createdAt = new Date(date);
    }

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
