import { sql, ensureSchema, DbTeamTournamentRow, DbTeamPlayerRow, DbTeamMatchRow } from './db';
import { Tournament, TeamPlayer, Match, MatchType, SetScore } from './gameLogic';

/**
 * Repository for team tournament database operations
 */

export async function saveTournament(tournament: Tournament): Promise<void> {
  await ensureSchema();

  // Use a transaction-like approach with Promise.all for parallel execution
  await Promise.all([
    // Insert or update tournament
    sql`
      insert into team_tournaments (
        id, access_code, date, team1_name, team2_name,
        team1_sets_won, team2_sets_won, team1_total_points, team2_total_points,
        tournament_winner, is_finalized, created_at
      ) values (
        ${tournament.id}, ${tournament.accessCode}, ${tournament.date},
        ${tournament.team1Name}, ${tournament.team2Name},
        ${tournament.team1SetsWon}, ${tournament.team2SetsWon},
        ${tournament.team1TotalPoints}, ${tournament.team2TotalPoints},
        ${tournament.tournamentWinner}, ${tournament.isFinalized},
        ${tournament.createdAt.toISOString()}
      )
      on conflict (id) do update set
        team1_name = excluded.team1_name,
        team2_name = excluded.team2_name,
        team1_sets_won = excluded.team1_sets_won,
        team2_sets_won = excluded.team2_sets_won,
        team1_total_points = excluded.team1_total_points,
        team2_total_points = excluded.team2_total_points,
        tournament_winner = excluded.tournament_winner,
        is_finalized = excluded.is_finalized
    `,

    // Batch insert team 1 players
    ...tournament.team1Players.map(player =>
      sql`
        insert into team_players (tournament_id, id, name, gender, team_number)
        values (${tournament.id}, ${player.id}, ${player.name}, ${player.gender}, 1)
        on conflict (tournament_id, team_number, id) do update set
          name = excluded.name
      `
    ),

    // Batch insert team 2 players
    ...tournament.team2Players.map(player =>
      sql`
        insert into team_players (tournament_id, id, name, gender, team_number)
        values (${tournament.id}, ${player.id}, ${player.name}, ${player.gender}, 2)
        on conflict (tournament_id, team_number, id) do update set
          name = excluded.name
      `
    ),

    // Batch insert matches
    ...tournament.matches.map(match =>
      sql`
        insert into team_matches (
          tournament_id, id, match_type,
          team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id,
          set1_team1_score, set1_team2_score, set1_winner,
          set2_team1_score, set2_team2_score, set2_winner,
          completed, match_winner
        ) values (
          ${tournament.id}, ${match.id}, ${match.matchType},
          ${match.team1Player1Id}, ${match.team1Player2Id},
          ${match.team2Player1Id}, ${match.team2Player2Id},
          ${match.set1?.team1Score ?? null}, ${match.set1?.team2Score ?? null}, ${match.set1?.winner ?? null},
          ${match.set2?.team1Score ?? null}, ${match.set2?.team2Score ?? null}, ${match.set2?.winner ?? null},
          ${match.completed}, ${match.matchWinner}
        )
        on conflict (tournament_id, id) do update set
          set1_team1_score = excluded.set1_team1_score,
          set1_team2_score = excluded.set1_team2_score,
          set1_winner = excluded.set1_winner,
          set2_team1_score = excluded.set2_team1_score,
          set2_team2_score = excluded.set2_team2_score,
          set2_winner = excluded.set2_winner,
          completed = excluded.completed,
          match_winner = excluded.match_winner
      `
    )
  ]);
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  await ensureSchema();

  const tournamentRows = await sql<DbTeamTournamentRow[]>`
    select * from team_tournaments where id = ${id}
  `;

  if (tournamentRows.length === 0) return null;

  const tournamentRow = tournamentRows[0];

  const team1PlayerRows = await sql<DbTeamPlayerRow[]>`
    select * from team_players 
    where tournament_id = ${id} and team_number = 1
    order by id
  `;

  const team2PlayerRows = await sql<DbTeamPlayerRow[]>`
    select * from team_players 
    where tournament_id = ${id} and team_number = 2
    order by id
  `;

  const matchRows = await sql<DbTeamMatchRow[]>`
    select * from team_matches
    where tournament_id = ${id}
    order by id
  `;

  const team1Players: TeamPlayer[] = team1PlayerRows.map((row: any) => ({
    id: row.id,
    name: row.name,
    gender: row.gender as 'M' | 'W',
    teamNumber: 1
  }));

  const team2Players: TeamPlayer[] = team2PlayerRows.map((row: any) => ({
    id: row.id,
    name: row.name,
    gender: row.gender as 'M' | 'W',
    teamNumber: 2
  }));

  const matches: Match[] = matchRows.map(row => ({
    id: row.id,
    matchType: row.match_type as MatchType,
    team1Player1Id: row.team1_player1_id,
    team1Player2Id: row.team1_player2_id,
    team2Player1Id: row.team2_player1_id,
    team2Player2Id: row.team2_player2_id,
    set1: row.set1_team1_score !== null ? {
      team1Score: row.set1_team1_score,
      team2Score: row.set1_team2_score!,
      winner: row.set1_winner as 1 | 2 | null
    } : null,
    set2: row.set2_team1_score !== null ? {
      team1Score: row.set2_team1_score,
      team2Score: row.set2_team2_score!,
      winner: row.set2_winner as 1 | 2 | null
    } : null,
    completed: row.completed,
    matchWinner: row.match_winner as 1 | 2 | null
  }));

  return {
    id: tournamentRow.id,
    accessCode: tournamentRow.access_code,
    date: tournamentRow.date,
    team1Name: tournamentRow.team1_name,
    team2Name: tournamentRow.team2_name,
    team1Players,
    team2Players,
    matches,
    team1SetsWon: tournamentRow.team1_sets_won,
    team2SetsWon: tournamentRow.team2_sets_won,
    team1TotalPoints: tournamentRow.team1_total_points,
    team2TotalPoints: tournamentRow.team2_total_points,
    tournamentWinner: tournamentRow.tournament_winner as 1 | 2 | null,
    isFinalized: tournamentRow.is_finalized,
    createdAt: new Date(tournamentRow.created_at)
  };
}

export async function getTournamentByCode(accessCode: string): Promise<Tournament | null> {
  await ensureSchema();

  const tournamentRows = await sql<DbTeamTournamentRow[]>`
    select * from team_tournaments where access_code = ${accessCode} order by created_at desc limit 1
  `;

  if (tournamentRows.length === 0) return null;

  return getTournamentById(tournamentRows[0].id);
}

export async function getActiveTournament(): Promise<Tournament | null> {
  await ensureSchema();

  const tournamentRows = await sql<DbTeamTournamentRow[]>`
    select * from team_tournaments where is_finalized = false order by created_at desc limit 1
  `;

  if (tournamentRows.length === 0) return null;

  return getTournamentById(tournamentRows[0].id);
}

export async function getTournamentHistory(): Promise<Tournament[]> {
  await ensureSchema();

  const tournamentRows = await sql<DbTeamTournamentRow[]>`
    select * from team_tournaments where is_finalized = true order by date desc, created_at desc limit 50
  `;

  const tournaments: Tournament[] = [];
  for (const row of tournamentRows) {
    const tournament = await getTournamentById(row.id);
    if (tournament) {
      tournaments.push(tournament);
    }
  }

  return tournaments;
}

export async function deleteTournament(id: string): Promise<void> {
  await ensureSchema();
  await sql`delete from team_tournaments where id = ${id}`;
}
