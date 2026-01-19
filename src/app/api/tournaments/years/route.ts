import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';

export async function GET() {
  try {
    await ensureSchema();

    // Get distinct years from tournaments
    const rows = await sql<{ year: string }[]>`
      SELECT DISTINCT EXTRACT(YEAR FROM created_at::timestamp)::text as year
      FROM team_tournaments
      WHERE is_finalized = true
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
