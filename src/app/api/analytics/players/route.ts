import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    
    // Get tournaments filtered by year
    const tournaments = year
      ? await sql`SELECT id, date FROM team_tournaments WHERE is_finalized = true AND date LIKE ${year + '%'}`
      : await sql`SELECT id, date FROM team_tournaments WHERE is_finalized = true`;

    if (tournaments.length === 0) {
      return NextResponse.json([]);
    }

    const tournamentIds = tournaments.map((t: any) => t.id);
    
    // Fetch all data in bulk
    const [allPlayers, allMatches] = await Promise.all([
      sql`SELECT * FROM team_players WHERE tournament_id = ANY(${tournamentIds})`,
      sql`SELECT * FROM team_matches WHERE tournament_id = ANY(${tournamentIds}) AND completed = true`
    ]);

    // Create lookup maps for fast access
    const tournamentDateMap: { [id: string]: string } = {};
    tournaments.forEach(t => { tournamentDateMap[t.id] = t.date; });

    const playersByTournament: { [tid: string]: any[] } = {};
    allPlayers.forEach((p: any) => {
      if (!playersByTournament[p.tournament_id]) playersByTournament[p.tournament_id] = [];
      playersByTournament[p.tournament_id].push(p);
    });

    // Build player statistics
    const playerMap: { [name: string]: any } = {};
    
    allMatches.forEach((match: any) => {
      const teamPlayers = playersByTournament[match.tournament_id] || [];
      
      // Process all players in this match
      teamPlayers.forEach((player: any) => {
        const isTeam1 = player.team_number === 1;
        const isInMatch = isTeam1 
          ? (match.team1_player1_id === player.id || match.team1_player2_id === player.id)
          : (match.team2_player1_id === player.id || match.team2_player2_id === player.id);

        if (!isInMatch || !match.match_winner) return;

        const playerName = player.name;
        if (!playerMap[playerName]) {
          playerMap[playerName] = {
            name: playerName,
            wins: 0,
            losses: 0,
            details: []
          };
        }

        const won = match.match_winner === player.team_number;
        if (won) {
          playerMap[playerName].wins++;
        } else {
          playerMap[playerName].losses++;
        }

        // Get partner
        const partnerId = isTeam1
          ? (match.team1_player1_id === player.id ? match.team1_player2_id : match.team1_player1_id)
          : (match.team2_player1_id === player.id ? match.team2_player2_id : match.team2_player1_id);
        
        const partnerData = teamPlayers.find((p: any) => 
          p.id === partnerId && p.team_number === player.team_number
        );

        // Get opponents
        const oppTeam = isTeam1 ? 2 : 1;
        const opp1Id = isTeam1 ? match.team2_player1_id : match.team1_player1_id;
        const opp2Id = isTeam1 ? match.team2_player2_id : match.team1_player2_id;
        
        const opp1Data = teamPlayers.find((p: any) => p.id === opp1Id && p.team_number === oppTeam);
        const opp2Data = teamPlayers.find((p: any) => p.id === opp2Id && p.team_number === oppTeam);

        playerMap[playerName].details.push({
          won,
          matchType: match.match_type,
          partner: partnerData?.name || '?',
          opponents: `${opp1Data?.name || '?'} / ${opp2Data?.name || '?'}`,
          score: `${match.set1_team1_score}-${match.set1_team2_score}, ${match.set2_team1_score}-${match.set2_team2_score}`,
          date: tournamentDateMap[match.tournament_id],
          opponent1: opp1Data?.name || '?',
          opponent2: opp2Data?.name || '?',
          team1Score: (match.set1_team1_score || 0) + (match.set2_team1_score || 0),
          team2Score: (match.set1_team2_score || 0) + (match.set2_team2_score || 0)
        });
      });
    });

    // Convert to array and calculate win rates
    const playerArray = Object.values(playerMap).map((p: any) => ({
      ...p,
      winRate: p.wins + p.losses > 0 ? ((p.wins / (p.wins + p.losses)) * 100).toFixed(1) : '0.0'
    })).sort((a: any, b: any) => parseFloat(b.winRate) - parseFloat(a.winRate));

    return NextResponse.json(playerArray);
  } catch (error: any) {
    console.error('Error fetching player analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
