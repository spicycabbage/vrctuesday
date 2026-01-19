import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const player1 = searchParams.get('player1');
    const player2 = searchParams.get('player2');
    const year = searchParams.get('year');

    if (!player1 || !player2) {
      return NextResponse.json(
        { error: 'Both players are required' },
        { status: 400 }
      );
    }

    // Get tournaments filtered by year
    const tournaments = year
      ? await sql`SELECT id, date FROM team_tournaments WHERE is_finalized = true AND date LIKE ${year + '%'}`
      : await sql`SELECT id, date FROM team_tournaments WHERE is_finalized = true`;

    if (tournaments.length === 0) {
      return NextResponse.json({
        player1,
        player2,
        wins: 0,
        losses: 0,
        winRate: '0.0',
        matches: []
      });
    }

    const tournamentIds = tournaments.map(t => t.id);
    
    // Fetch all data in bulk
    const [allPlayers, allMatches] = await Promise.all([
      sql`SELECT * FROM team_players WHERE tournament_id = ANY(${tournamentIds}) AND (name = ${player1} OR name = ${player2})`,
      sql`SELECT * FROM team_matches WHERE tournament_id = ANY(${tournamentIds}) AND completed = true`
    ]);

    // Create lookup maps
    const tournamentDateMap: { [id: string]: string } = {};
    tournaments.forEach(t => { tournamentDateMap[t.id] = t.date; });

    const playersByTournament: { [tid: string]: any[] } = {};
    allPlayers.forEach((p: any) => {
      if (!playersByTournament[p.tournament_id]) playersByTournament[p.tournament_id] = [];
      playersByTournament[p.tournament_id].push(p);
    });

    let wins = 0;
    let losses = 0;
    const matchDetails: any[] = [];

    // Get all players for opponent lookups
    const allTournamentPlayers = await sql`SELECT * FROM team_players WHERE tournament_id = ANY(${tournamentIds})`;
    const allPlayersByTournament: { [tid: string]: any[] } = {};
    allTournamentPlayers.forEach((p: any) => {
      if (!allPlayersByTournament[p.tournament_id]) allPlayersByTournament[p.tournament_id] = [];
      allPlayersByTournament[p.tournament_id].push(p);
    });

    allMatches.forEach((match: any) => {
      const players = playersByTournament[match.tournament_id] || [];
      const allPlayers = allPlayersByTournament[match.tournament_id] || [];
      
      const p1 = players.find((p: any) => p.name === player1);
      const p2 = players.find((p: any) => p.name === player2);

      if (!p1 || !p2 || p1.team_number !== p2.team_number) return;

      const teamNumber = p1.team_number;
      const isTeam1 = teamNumber === 1;
      
      const teamPlayer1Id = isTeam1 ? match.team1_player1_id : match.team2_player1_id;
      const teamPlayer2Id = isTeam1 ? match.team1_player2_id : match.team2_player2_id;

      const playedTogether = 
        (teamPlayer1Id === p1.id && teamPlayer2Id === p2.id) ||
        (teamPlayer1Id === p2.id && teamPlayer2Id === p1.id);

      if (!playedTogether || !match.match_winner) return;

      const won = match.match_winner === teamNumber;
      if (won) wins++;
      else losses++;

      // Get opponents
      const oppTeam = isTeam1 ? 2 : 1;
      const opp1Id = isTeam1 ? match.team2_player1_id : match.team1_player1_id;
      const opp2Id = isTeam1 ? match.team2_player2_id : match.team1_player2_id;
      
      const opp1 = allPlayers.find((p: any) => p.id === opp1Id && p.team_number === oppTeam);
      const opp2 = allPlayers.find((p: any) => p.id === opp2Id && p.team_number === oppTeam);

      matchDetails.push({
        won,
        matchType: match.match_type,
        opponents: `${opp1?.name || '?'} / ${opp2?.name || '?'}`,
        score: `${match.set1_team1_score}-${match.set1_team2_score}, ${match.set2_team1_score}-${match.set2_team2_score}`,
        date: tournamentDateMap[match.tournament_id]
      });
    });

    const total = wins + losses;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      player1,
      player2,
      wins,
      losses,
      winRate,
      matches: matchDetails
    });
  } catch (error: any) {
    console.error('Error fetching partnership stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch partnership stats' },
      { status: 500 }
    );
  }
}
