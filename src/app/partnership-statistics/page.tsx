'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface MatchDetail {
  won: boolean;
  matchType: string;
  opponents: string;
  score: string;
  date: string;
  setNumber?: number;
}

interface PartnershipStats {
  player1: string;
  player2: string;
  wins: number;
  losses: number;
  winRate: string;
  matches: MatchDetail[];
}

function PartnershipStatisticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || 'all';
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [stats, setStats] = useState<PartnershipStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/analytics/all-players');
      if (!response.ok) throw new Error('Failed to fetch players');
      
      const data = await response.json();
      setAllPlayers(data);
      setLoadingPlayers(false);
    } catch (err) {
      console.error(err);
      setLoadingPlayers(false);
    }
  };

  const fetchPartnershipStats = async () => {
    if (!player1 || !player2) {
      alert('Please select both players');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/partnership?player1=${encodeURIComponent(player1)}&player2=${encodeURIComponent(player2)}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch partnership stats');
      
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch partnership stats');
      setLoading(false);
    }
  };

  // Get available players for second dropdown (exclude player1)
  const availablePlayer2 = allPlayers.filter(p => p !== player1);

  if (loadingPlayers) {
    return (
      <div className="mobile-container safe-area-inset-top">
        <div className="tournament-card mt-12">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container safe-area-inset-top safe-area-inset-bottom pb-8">
      <div className="bg-white shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Partnership Statistics
        </h1>
        <p className="text-center text-sm text-gray-600 mt-1">Year: {year}</p>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Select First Player
              </label>
              <select
                value={player1}
                onChange={(e) => {
                  setPlayer1(e.target.value);
                  if (e.target.value === player2) {
                    setPlayer2('');
                  }
                  setStats(null);
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-100"
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Select Second Player
              </label>
              <select
                value={player2}
                onChange={(e) => {
                  setPlayer2(e.target.value);
                  setStats(null);
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-100"
                disabled={!player1}
              >
                <option value="">Choose a partner...</option>
                {availablePlayer2.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchPartnershipStats}
              disabled={!player1 || !player2 || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Get Partnership Stats'}
            </button>
          </div>
        </div>

        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
              {stats.player1} & {stats.player2}
            </h2>

            <div className="flex justify-around items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.wins}</p>
                <p className="text-sm text-gray-600">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{stats.losses}</p>
                <p className="text-sm text-gray-600">Losses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.winRate}%</p>
                <p className="text-sm text-gray-600">Win Rate</p>
              </div>
            </div>

            {stats.matches.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Match History</h3>
                <div className="space-y-2">
                  {stats.matches.map((match, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded text-sm ${
                        match.won ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold ${match.won ? 'text-green-700' : 'text-red-700'}`}>
                          {match.won ? 'WIN' : 'LOSS'}
                        </span>
                        <span className="text-xs text-gray-600">{match.date}</span>
                      </div>
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">{match.matchType}</span>
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        vs {match.opponents}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Set {match.setNumber || 1}: {match.score}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.matches.length === 0 && (
              <p className="text-center text-gray-600">No matches found for this partnership.</p>
            )}
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default function PartnershipStatistics() {
  return (
    <Suspense fallback={<div className="mobile-container safe-area-inset-top safe-area-inset-bottom"><div className="tournament-card mt-12"><p className="text-center text-gray-600">Loading...</p></div></div>}>
      <PartnershipStatisticsContent />
    </Suspense>
  );
}
