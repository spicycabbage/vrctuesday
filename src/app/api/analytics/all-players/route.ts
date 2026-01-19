import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const players = await sql`
      SELECT DISTINCT name FROM team_players ORDER BY name ASC
    `;

    const playerNames = players.map((p: any) => p.name);
    return NextResponse.json(playerNames);
  } catch (error: any) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch players' },
      { status: 500 }
    );
  }
}
