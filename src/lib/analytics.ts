import { sql } from '@/lib/db';

export type PlayerRow = {
  tournament_id: string;
  id: number;
  name: string;
  team_number: number;
};

export type MatchRow = {
  tournament_id: string;
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
};

export type Detail = {
  won: boolean;
  matchType: string;
  partner: string;
  opponents: string;
  score: string;
  date: string;
  opponent1: string;
  opponent2: string;
  team1Score: number;
  team2Score: number;
  setNumber: number;
};

export type H2H = {
  opponent: string;
  wins: number;
  losses: number;
  winRate: string;
  margin: string;
};

export type PlayerSummary = {
  name: string;
  wins: number;
  losses: number;
  winRate: string;
};

export type PlayerFull = PlayerSummary & {
  details: Detail[];
  headToHead: H2H[];
};

type PlayerAgg = {
  name: string;
  wins: number;
  losses: number;
  details: Detail[];
  h2hMap: Map<string, { wins: number; losses: number; marginSum: number; marginCount: number }>;
};

async function getTournaments(year: string | null) {
  return (year && year !== 'all')
    ? await sql`SELECT id, date FROM team_tournaments WHERE is_finalized = true AND date LIKE ${year + '%'}`
    : await sql`SELECT id, date FROM team_tournaments WHERE is_finalized = true`;
}

/**
 * Aggregate player stats across the given tournaments. If `targetName` is provided,
 * only that player's row is returned (still needs all four player slots per match
 * to compute partner/opponents, but skips aggregation for everyone else).
 */
function aggregate(
  tournaments: any[],
  allPlayers: PlayerRow[],
  allMatches: MatchRow[],
  targetName?: string,
): PlayerFull[] {
  const tournamentDateMap = new Map<string, string>();
  for (const t of tournaments) tournamentDateMap.set(t.id, t.date);

  const playerLookup = new Map<string, Map<string, string>>();
  for (const p of allPlayers) {
    let m = playerLookup.get(p.tournament_id);
    if (!m) {
      m = new Map();
      playerLookup.set(p.tournament_id, m);
    }
    m.set(`${p.team_number}_${p.id}`, p.name);
  }

  const playerMap = new Map<string, PlayerAgg>();
  const getAgg = (name: string): PlayerAgg | null => {
    if (targetName && name !== targetName) return null;
    let a = playerMap.get(name);
    if (!a) {
      a = { name, wins: 0, losses: 0, details: [], h2hMap: new Map() };
      playerMap.set(name, a);
    }
    return a;
  };

  const recordSet = (
    agg: PlayerAgg,
    won: boolean,
    partnerName: string,
    oppNames: string,
    opp1Name: string,
    opp2Name: string,
    t1Score: number,
    t2Score: number,
    ownTeam: number,
    matchType: string,
    date: string,
    setNumber: number,
  ) => {
    if (won) agg.wins++; else agg.losses++;
    const margin = ownTeam === 1 ? (t1Score - t2Score) : (t2Score - t1Score);

    let h = agg.h2hMap.get(oppNames);
    if (!h) {
      h = { wins: 0, losses: 0, marginSum: 0, marginCount: 0 };
      agg.h2hMap.set(oppNames, h);
    }
    if (won) h.wins++; else h.losses++;
    h.marginSum += margin;
    h.marginCount++;

    agg.details.push({
      won,
      matchType,
      partner: partnerName,
      opponents: oppNames,
      score: `${t1Score}-${t2Score}`,
      date,
      opponent1: opp1Name,
      opponent2: opp2Name,
      team1Score: t1Score || 0,
      team2Score: t2Score || 0,
      setNumber,
    });
  };

  for (const match of allMatches) {
    const lookup = playerLookup.get(match.tournament_id);
    if (!lookup) continue;
    const date = tournamentDateMap.get(match.tournament_id) || '';

    const t1p1 = lookup.get(`1_${match.team1_player1_id}`);
    const t1p2 = lookup.get(`1_${match.team1_player2_id}`);
    const t2p1 = lookup.get(`2_${match.team2_player1_id}`);
    const t2p2 = lookup.get(`2_${match.team2_player2_id}`);

    const team2Names = [t2p1 || '?', t2p2 || '?'].sort().join(' / ');
    const team1Names = [t1p1 || '?', t1p2 || '?'].sort().join(' / ');

    const sides = [
      { name: t1p1, partner: t1p2 || '?', oppPair: team2Names, opp1: t2p1 || '?', opp2: t2p2 || '?', team: 1 },
      { name: t1p2, partner: t1p1 || '?', oppPair: team2Names, opp1: t2p1 || '?', opp2: t2p2 || '?', team: 1 },
      { name: t2p1, partner: t2p2 || '?', oppPair: team1Names, opp1: t1p1 || '?', opp2: t1p2 || '?', team: 2 },
      { name: t2p2, partner: t2p1 || '?', oppPair: team1Names, opp1: t1p1 || '?', opp2: t1p2 || '?', team: 2 },
    ];

    for (const side of sides) {
      if (!side.name) continue;
      const agg = getAgg(side.name);
      if (!agg) continue;

      if (match.set1_winner != null) {
        recordSet(
          agg,
          match.set1_winner === side.team,
          side.partner, side.oppPair, side.opp1, side.opp2,
          match.set1_team1_score ?? 0, match.set1_team2_score ?? 0,
          side.team, match.match_type, date, 1,
        );
      }
      if (match.set2_winner != null) {
        recordSet(
          agg,
          match.set2_winner === side.team,
          side.partner, side.oppPair, side.opp1, side.opp2,
          match.set2_team1_score ?? 0, match.set2_team2_score ?? 0,
          side.team, match.match_type, date, 2,
        );
      }
    }
  }

  return Array.from(playerMap.values()).map((p) => {
    const total = p.wins + p.losses;
    const headToHead: H2H[] = Array.from(p.h2hMap.entries())
      .map(([opponent, s]) => {
        const t = s.wins + s.losses;
        const avg = s.marginCount > 0 ? s.marginSum / s.marginCount : 0;
        return {
          opponent,
          wins: s.wins,
          losses: s.losses,
          winRate: t > 0 ? ((s.wins / t) * 100).toFixed(0) : '0',
          margin: avg > 0 ? `+${avg.toFixed(1)}` : avg.toFixed(1),
        };
      })
      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));

    return {
      name: p.name,
      wins: p.wins,
      losses: p.losses,
      winRate: total > 0 ? ((p.wins / total) * 100).toFixed(1) : '0.0',
      details: p.details,
      headToHead,
    };
  }).sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
}

/**
 * Lightweight summary for the list view. Skips per-match details and h2h work
 * by aggregating wins/losses directly while scanning matches once.
 */
export async function getPlayerSummaries(year: string | null): Promise<PlayerSummary[]> {
  const tournaments = await getTournaments(year);
  if (tournaments.length === 0) return [];
  const tournamentIds = tournaments.map((t: any) => t.id);

  const [allPlayers, allMatches] = await Promise.all([
    sql`SELECT tournament_id, id, name, team_number
        FROM team_players
        WHERE tournament_id = ANY(${tournamentIds})` as Promise<PlayerRow[]>,
    sql`SELECT tournament_id,
               team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id,
               set1_winner, set2_winner
        FROM team_matches
        WHERE tournament_id = ANY(${tournamentIds}) AND completed = true`,
  ]);

  const playerLookup = new Map<string, Map<string, string>>();
  for (const p of allPlayers) {
    let m = playerLookup.get(p.tournament_id);
    if (!m) {
      m = new Map();
      playerLookup.set(p.tournament_id, m);
    }
    m.set(`${p.team_number}_${p.id}`, p.name);
  }

  const totals = new Map<string, { wins: number; losses: number }>();
  const bump = (name: string | undefined, won: boolean) => {
    if (!name) return;
    let r = totals.get(name);
    if (!r) {
      r = { wins: 0, losses: 0 };
      totals.set(name, r);
    }
    if (won) r.wins++; else r.losses++;
  };

  for (const m of allMatches as any[]) {
    const lookup = playerLookup.get(m.tournament_id);
    if (!lookup) continue;
    const t1p1 = lookup.get(`1_${m.team1_player1_id}`);
    const t1p2 = lookup.get(`1_${m.team1_player2_id}`);
    const t2p1 = lookup.get(`2_${m.team2_player1_id}`);
    const t2p2 = lookup.get(`2_${m.team2_player2_id}`);

    for (const winner of [m.set1_winner, m.set2_winner] as Array<number | null>) {
      if (winner == null) continue;
      bump(t1p1, winner === 1);
      bump(t1p2, winner === 1);
      bump(t2p1, winner === 2);
      bump(t2p2, winner === 2);
    }
  }

  return Array.from(totals.entries())
    .map(([name, r]) => {
      const total = r.wins + r.losses;
      return {
        name,
        wins: r.wins,
        losses: r.losses,
        winRate: total > 0 ? ((r.wins / total) * 100).toFixed(1) : '0.0',
      };
    })
    .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
}

/**
 * Full details + head-to-head for a single player. Restricts the match scan to
 * tournaments where the player actually appears.
 */
export async function getPlayerDetails(year: string | null, name: string): Promise<PlayerFull | null> {
  const tournaments = await getTournaments(year);
  if (tournaments.length === 0) return null;
  const tournamentIds = tournaments.map((t: any) => t.id);

  // Only tournaments that include this player.
  const playerTournaments = await sql`
    SELECT DISTINCT tournament_id
    FROM team_players
    WHERE name = ${name} AND tournament_id = ANY(${tournamentIds})
  ` as Array<{ tournament_id: string }>;

  if (playerTournaments.length === 0) {
    return { name, wins: 0, losses: 0, winRate: '0.0', details: [], headToHead: [] };
  }
  const scopedIds = playerTournaments.map((t) => t.tournament_id);
  const scopedTournaments = (tournaments as any[]).filter((t) => scopedIds.includes(t.id));

  const [allPlayers, allMatches] = await Promise.all([
    sql`SELECT tournament_id, id, name, team_number
        FROM team_players
        WHERE tournament_id = ANY(${scopedIds})` as Promise<PlayerRow[]>,
    sql`SELECT tournament_id, match_type,
               team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id,
               set1_team1_score, set1_team2_score, set1_winner,
               set2_team1_score, set2_team2_score, set2_winner
        FROM team_matches
        WHERE tournament_id = ANY(${scopedIds}) AND completed = true` as Promise<MatchRow[]>,
  ]);

  const result = aggregate(scopedTournaments, allPlayers, allMatches, name);
  return result[0] || { name, wins: 0, losses: 0, winRate: '0.0', details: [], headToHead: [] };
}
