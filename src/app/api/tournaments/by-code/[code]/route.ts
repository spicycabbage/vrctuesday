import { NextRequest, NextResponse } from 'next/server';
import { getTournamentByCode } from '@/lib/tournamentRepo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const tournament = await getTournamentByCode(code);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found with this access code' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tournamentId: tournament.id
    });
  } catch (error: any) {
    console.error('Error fetching tournament by code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}
