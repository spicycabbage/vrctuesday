import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!databaseUrl) {
  // We intentionally don't throw at import-time to avoid build breaks without envs
  // API routes will error if this is missing when called.
}

export const sql = databaseUrl ? neon(databaseUrl) : (async () => { throw new Error('DATABASE_URL not set'); }) as any;

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    await sql`create table if not exists team_tournaments (
      id text primary key,
      access_code text not null,
      date text not null,
      team1_name text not null,
      team2_name text not null,
      team1_sets_won int not null default 0,
      team2_sets_won int not null default 0,
      team1_total_points int not null default 0,
      team2_total_points int not null default 0,
      tournament_winner int,
      is_finalized boolean not null default false,
      created_at timestamptz not null default now()
    )`;

    await sql`create table if not exists team_players (
      tournament_id text not null,
      id int not null,
      name text not null,
      gender text not null,
      team_number int not null,
      primary key (tournament_id, team_number, id),
      foreign key (tournament_id) references team_tournaments(id) on delete cascade
    )`;

    await sql`create table if not exists team_matches (
      tournament_id text not null,
      id int not null,
      match_type text not null,
      team1_player1_id int not null,
      team1_player2_id int not null,
      team2_player1_id int not null,
      team2_player2_id int not null,
      set1_team1_score int,
      set1_team2_score int,
      set1_winner int,
      set2_team1_score int,
      set2_team2_score int,
      set2_winner int,
      completed boolean not null default false,
      match_winner int,
      primary key (tournament_id, id),
      foreign key (tournament_id) references team_tournaments(id) on delete cascade
    )`;

    // Add performance indexes
    try {
      await sql`create index if not exists idx_team_tournaments_code on team_tournaments(access_code)`;
      await sql`create index if not exists idx_team_tournaments_finalized_date on team_tournaments(is_finalized, date)`;
      await sql`create index if not exists idx_team_players_tournament on team_players(tournament_id)`;
      await sql`create index if not exists idx_team_players_name on team_players(name)`;
      await sql`create index if not exists idx_team_matches_tournament on team_matches(tournament_id)`;
      await sql`create index if not exists idx_team_matches_type on team_matches(tournament_id, match_type)`;
      await sql`create index if not exists idx_team_matches_completed on team_matches(tournament_id, completed)`;
    } catch (e) {
      // Indexes might already exist, ignore error
    }
  })();
  return schemaReady;
}

export type DbTeamTournamentRow = {
  id: string;
  access_code: string;
  date: string;
  team1_name: string;
  team2_name: string;
  team1_sets_won: number;
  team2_sets_won: number;
  team1_total_points: number;
  team2_total_points: number;
  tournament_winner: number | null;
  is_finalized: boolean;
  created_at: string;
};

export type DbTeamPlayerRow = {
  tournament_id: string;
  id: number;
  name: string;
  gender: string;
  team_number: number;
};

export type DbTeamMatchRow = {
  tournament_id: string;
  id: number;
  match_type: string;
  team1_player1_id: number;
  team1_player2_id: number;
  team2_player1_id: number;
  team2_player2_id: number;
  set1_team1_score: number | null;
  set1_team2_score: number | null;
  set1_winner: number | null;
  set2_team1_score: number | null;
  set2_team2_score: number | null;
  set2_winner: number | null;
  completed: boolean;
  match_winner: number | null;
};
