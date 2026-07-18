import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';

export async function GET() {
  try {
    await ensureSchema();

    // Year filter uses the PST calendar `date` text field, not UTC created_at
    const rows = await sql<{ year: string }[]>`
      SELECT DISTINCT left(date, 4) as year
      FROM team_tournaments
      WHERE is_finalized = true
        AND date ~ '^[0-9]{4}'
      ORDER BY year DESC
    `;

    const years = rows.map((row: any) => row.year);

    return NextResponse.json(years);
  } catch (error: any) {
    console.error('Error fetching years:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch years' },
      { status: 500 }
    );
  }
}
