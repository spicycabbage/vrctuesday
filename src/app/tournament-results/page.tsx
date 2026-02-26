'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tournament } from '@/lib/gameLogic';
import ResultsTab from '@/components/ResultsTab';

function TournamentResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || 'all';
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [year]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/tournaments/history?year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setTournaments(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="tournament-card mt-6">
          <p className="text-center text-indigo-500 text-sm">Loading history…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container safe-area-inset-bottom pb-8">
      <div className="page-section-header">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-indigo-500 hover:text-indigo-700 text-sm font-medium">← Back</button>
          <h1 className="text-lg font-bold text-indigo-900">Tournament History</h1>
          <div className="w-16" />
        </div>
        <p className="text-center text-xs text-indigo-500 mt-0.5">
          {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} {year === 'all' ? 'total' : `in ${year}`}
        </p>
      </div>

      <div className="px-4">
        {tournaments.length === 0 ? (
          <div className="bg-white rounded-xl border border-indigo-200 p-6 text-center">
            <p className="text-indigo-500 text-sm">No finalized tournaments yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tournaments.map((tournament) => {
              const isExpanded = expandedId === tournament.id;
              const winnerName = tournament.tournamentWinner
                ? (tournament.tournamentWinner === 1 ? tournament.team1Name : tournament.team2Name)
                : 'Incomplete';

              const formattedDate = new Date(tournament.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={tournament.id} className="overflow-hidden rounded-xl border border-indigo-200">
                  <button
                    onClick={() => toggleExpand(tournament.id)}
                    className="w-full px-4 py-3.5 bg-indigo-700 hover:bg-indigo-600 text-white transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm">{formattedDate}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏆</span>
                        <span className="font-bold text-amber-300 text-sm">{winnerName}</span>
                        <span className="text-indigo-300 text-xs ml-1">
                          {tournament.team1SetsWon}–{tournament.team2SetsWon}
                        </span>
                        <span className="text-indigo-400 ml-1 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-white p-4">
                      <ResultsTab tournament={tournament} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => router.push('/')} className="btn-back mt-6">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default function TournamentResults() {
  return (
    <Suspense fallback={<div className="mobile-container"><div className="tournament-card mt-6"><p className="text-center text-indigo-500 text-sm">Loading…</p></div></div>}>
      <TournamentResultsContent />
    </Suspense>
  );
}
