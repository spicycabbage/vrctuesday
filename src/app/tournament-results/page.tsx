'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tournament } from '@/lib/gameLogic';
import ResultsTab from '@/components/ResultsTab';

function TournamentResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || '2026';
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
      <div className="mobile-container safe-area-inset-top">
        <div className="tournament-card mt-12">
          <p className="text-center text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container safe-area-inset-top safe-area-inset-bottom pb-8">
      <div className="bg-white shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Tournament History
        </h1>
        <p className="text-center text-sm text-gray-600 mt-1">
          {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} in {year}
        </p>
      </div>

      <div className="px-4">
        {tournaments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">No finalized tournaments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament, index) => {
              const isExpanded = expandedId === tournament.id;
              const winnerName = tournament.tournamentWinner 
                ? (tournament.tournamentWinner === 1 ? tournament.team1Name : tournament.team2Name)
                : 'Incomplete';
              
              return (
                <div key={tournament.id} className="max-w-full overflow-hidden">
                  <button
                    onClick={() => toggleExpand(tournament.id)}
                    className="w-full p-4 rounded-lg text-white transition-colors bg-black hover:bg-gray-900"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">📅</div>
                        <div className="text-left">
                          <p className="font-bold text-lg">{tournament.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-2xl">🏆</span>
                          <span className="font-bold text-yellow-400 text-lg">{winnerName}</span>
                        </div>
                        <p className="text-sm opacity-80 mt-1">
                          {tournament.team1SetsWon} - {tournament.team2SetsWon}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 bg-white rounded-lg max-w-full">
                      <div className="p-4">
                        <ResultsTab tournament={tournament} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition mt-6"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default function TournamentResults() {
  return (
    <Suspense fallback={<div className="mobile-container safe-area-inset-top safe-area-inset-bottom"><div className="tournament-card mt-12"><p className="text-center text-gray-600">Loading...</p></div></div>}>
      <TournamentResultsContent />
    </Suspense>
  );
}
