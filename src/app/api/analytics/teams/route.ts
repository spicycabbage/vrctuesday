import { NextRequest, NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { TournamentFormat } from '@/lib/gameLogic';

type TeamAgg = {
  name: string;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  pointsFor: number;
  pointsAgainst: number;
};

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || 'all';
    const formatParam = searchParams.get('format') || '6v6';
    const format: TournamentFormat = formatParam === '8v8' ? '8v8' : '6v6';

    const rows =
      year === 'all'
        ? await sql`
            SELECT team1_name, team2_name, team1_sets_won, team2_sets_won,
                   team1_total_points, team2_total_points, tournament_winner, format
            FROM team_tournaments
            WHERE is_finalized = true
              AND COALESCE(format, '6v6') = ${format}
          `
        : await sql`
            SELECT team1_name, team2_name, team1_sets_won, team2_sets_won,
                   team1_total_points, team2_total_points, tournament_winner, format
            FROM team_tournaments
            WHERE is_finalized = true
              AND COALESCE(format, '6v6') = ${format}
              AND date LIKE ${year + '%'}
          `;

    const byName = new Map<string, TeamAgg>();

    const ensure = (name: string): TeamAgg => {
      const key = name.trim();
      let row = byName.get(key);
      if (!row) {
        row = {
          name: key,
          wins: 0,
          losses: 0,
          setsFor: 0,
          setsAgainst: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        };
        byName.set(key, row);
      }
      return row;
    };

    for (const t of rows as any[]) {
      const t1 = ensure(t.team1_name);
      const t2 = ensure(t.team2_name);

      t1.setsFor += t.team1_sets_won;
      t1.setsAgainst += t.team2_sets_won;
      t1.pointsFor += t.team1_total_points;
      t1.pointsAgainst += t.team2_total_points;

      t2.setsFor += t.team2_sets_won;
      t2.setsAgainst += t.team1_sets_won;
      t2.pointsFor += t.team2_total_points;
      t2.pointsAgainst += t.team1_total_points;

      if (t.tournament_winner === 1) {
        t1.wins++;
        t2.losses++;
      } else if (t.tournament_winner === 2) {
        t2.wins++;
        t1.losses++;
      }
    }

    const teams = Array.from(byName.values())
      .map((t) => {
        const played = t.wins + t.losses;
        return {
          ...t,
          played,
          winRate: played > 0 ? ((t.wins / played) * 100).toFixed(0) : '0',
        };
      })
      .sort((a, b) => {
        const wr = parseFloat(b.winRate) - parseFloat(a.winRate);
        if (wr !== 0) return wr;
        return b.wins - a.wins;
      });

    return NextResponse.json({ format, teams });
  } catch (error: any) {
    console.error('Error fetching team stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team stats' },
      { status: 500 }
    );
  }
}
