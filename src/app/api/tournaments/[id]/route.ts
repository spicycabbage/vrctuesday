import { NextRequest, NextResponse } from 'next/server';
import { getTournamentById } from '@/lib/tournamentRepo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await getTournamentById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error: any) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}
