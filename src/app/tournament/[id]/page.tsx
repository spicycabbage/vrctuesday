'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Tournament, Match, MatchType, getMatchesByType } from '@/lib/gameLogic';
import MatchesTab from '@/components/MatchesTab';
import ResultsTab from '@/components/ResultsTab';

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'XD' | 'MD' | 'WD' | 'Results'>('XD');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}`);
      if (!response.ok) throw new Error('Tournament not found');
      
      const data = await response.json();
      setTournament(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleScoreUpdate = async (
    matchId: number,
    setNumber: 1 | 2,
    team1Score: number,
    team2Score: number
  ) => {
    try {
      const response = await fetch(`/api/tournaments/${id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, setNumber, team1Score, team2Score })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update score');
      }

      await fetchTournament();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFinalize = async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}/finalize`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to finalize tournament');

      await fetchTournament();
      alert('Tournament finalized!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="mobile-container safe-area-inset-top flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="mobile-container safe-area-inset-top">
        <div className="tournament-card mt-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Tournament not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const xdMatches = getMatchesByType(tournament, 'XD');
  const mdMatches = getMatchesByType(tournament, 'MD');
  const wdMatches = getMatchesByType(tournament, 'WD');

  const isXDComplete = xdMatches.every(m => m.completed);
  const isMDComplete = mdMatches.every(m => m.completed);
  const isWDComplete = wdMatches.every(m => m.completed);
  const isTournamentComplete = isXDComplete && isMDComplete && isWDComplete;

  return (
    <div className="mobile-container safe-area-inset-top safe-area-inset-bottom pb-8">
      {/* Header */}
      <div className="bg-white shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">VRC Tuesday</h1>
        <p className="text-center text-sm text-gray-600 mt-1">{tournament.date}</p>
        <p className="text-center text-xs text-gray-500 mt-1">Code: {tournament.accessCode}</p>
        
        {/* Score Summary */}
        <div className="mt-4 flex justify-around items-center">
          <div className="text-center">
            <p className="text-xs text-gray-600">{tournament.team1Name}</p>
            <p className="text-2xl font-bold text-blue-600">{tournament.team1SetsWon}</p>
            <p className="text-xs text-gray-500">{tournament.team1TotalPoints} pts</p>
          </div>
          <div className="text-gray-400 text-2xl">vs</div>
          <div className="text-center">
            <p className="text-xs text-gray-600">{tournament.team2Name}</p>
            <p className="text-2xl font-bold text-red-600">{tournament.team2SetsWon}</p>
            <p className="text-xs text-gray-500">{tournament.team2TotalPoints} pts</p>
          </div>
        </div>

        {tournament.tournamentWinner && (
          <div className="mt-3 text-center">
            <p className="text-lg font-bold text-green-600">
              🏆 {tournament.tournamentWinner === 1 ? tournament.team1Name : tournament.team2Name} Wins!
            </p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setActiveTab('XD')}
            className={`match-tab-button ${
              activeTab === 'XD' 
                ? 'match-tab-active' 
                : isXDComplete 
                ? 'match-tab-completed' 
                : 'match-tab-inactive'
            }`}
          >
            XD {isXDComplete && '✓'}
          </button>
          <button
            onClick={() => setActiveTab('MD')}
            className={`match-tab-button ${
              activeTab === 'MD' 
                ? 'match-tab-active' 
                : isMDComplete 
                ? 'match-tab-completed' 
                : 'match-tab-inactive'
            }`}
          >
            MD {isMDComplete && '✓'}
          </button>
          <button
            onClick={() => setActiveTab('WD')}
            className={`match-tab-button ${
              activeTab === 'WD' 
                ? 'match-tab-active' 
                : isWDComplete 
                ? 'match-tab-completed' 
                : 'match-tab-inactive'
            }`}
          >
            WD {isWDComplete && '✓'}
          </button>
          <button
            onClick={() => setActiveTab('Results')}
            className={`match-tab-button ${
              activeTab === 'Results' ? 'match-tab-active' : 'match-tab-inactive'
            }`}
          >
            Results
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        {activeTab === 'XD' && (
          <MatchesTab
            matches={xdMatches}
            tournament={tournament}
            onScoreUpdate={handleScoreUpdate}
          />
        )}
        {activeTab === 'MD' && (
          <MatchesTab
            matches={mdMatches}
            tournament={tournament}
            onScoreUpdate={handleScoreUpdate}
          />
        )}
        {activeTab === 'WD' && (
          <MatchesTab
            matches={wdMatches}
            tournament={tournament}
            onScoreUpdate={handleScoreUpdate}
          />
        )}
        {activeTab === 'Results' && (
          <>
            <ResultsTab tournament={tournament} />
            
            {/* Actions - Only shown in Results tab */}
            <div className="mt-6 space-y-3">
              {isTournamentComplete && !tournament.isFinalized && (
                <button
                  onClick={handleFinalize}
                  className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Finalize Tournament
                </button>
              )}
              
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
