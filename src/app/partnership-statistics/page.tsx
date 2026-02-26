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

  const availablePlayer2 = allPlayers.filter(p => p !== player1);

  if (loadingPlayers) {
    return (
      <div className="mobile-container">
        <div className="tournament-card mt-6">
          <p className="text-center text-indigo-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container safe-area-inset-bottom pb-8">
      <div className="page-section-header">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-indigo-500 hover:text-indigo-700 text-2xl leading-none px-1">‹</button>
          <h1 className="text-lg font-bold text-indigo-900">Partnership Statistics</h1>
          <div className="w-16" />
        </div>
        <p className="text-center text-xs text-indigo-500 mt-0.5">{year === 'all' ? 'All Years' : year}</p>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-xl border border-indigo-200 p-4 mb-3">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-indigo-600 uppercase tracking-wide">
                First Player
              </label>
              <select
                value={player1}
                onChange={(e) => {
                  setPlayer1(e.target.value);
                  if (e.target.value === player2) setPlayer2('');
                  setStats(null);
                }}
                className="w-full px-3 py-2.5 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-sm text-indigo-900"
              >
                <option value="">Choose a player…</option>
                {allPlayers.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-indigo-600 uppercase tracking-wide">
                Second Player
              </label>
              <select
                value={player2}
                onChange={(e) => { setPlayer2(e.target.value); setStats(null); }}
                className="w-full px-3 py-2.5 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-sm text-indigo-900 disabled:opacity-40"
                disabled={!player1}
              >
                <option value="">Choose a partner…</option>
                {availablePlayer2.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchPartnershipStats}
              disabled={!player1 || !player2 || loading}
              className="btn-primary"
            >
              {loading ? 'Loading…' : 'View Partnership Stats'}
            </button>
          </div>
        </div>

        {stats && (
          <div className="bg-white rounded-xl border border-indigo-200 p-4 mb-3">
            <h2 className="text-base font-bold text-center text-indigo-900 mb-3">
              {stats.player1} & {stats.player2}
            </h2>

            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-indigo-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
                <p className="text-xs text-indigo-500 mt-0.5">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{stats.losses}</p>
                <p className="text-xs text-indigo-500 mt-0.5">Losses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-700">{stats.winRate}%</p>
                <p className="text-xs text-indigo-500 mt-0.5">Win Rate</p>
              </div>
            </div>

            {stats.matches.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">Match History</h3>
                <div className="space-y-1.5">
                  {stats.matches.map((match, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2.5 rounded-lg text-xs border-l-4 ${
                        match.won ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`font-bold ${match.won ? 'text-green-700' : 'text-red-600'}`}>
                          {match.won ? 'WIN' : 'LOSS'}
                        </span>
                        <span className="text-indigo-400">{match.date}</span>
                      </div>
                      <p className="text-indigo-700"><span className="font-semibold">{match.matchType}</span></p>
                      <p className="text-indigo-700 mt-0.5">vs {match.opponents}</p>
                      <p className="text-indigo-400 mt-0.5">Set {match.setNumber || 1}: {match.score}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-indigo-500 text-sm">No matches found for this partnership.</p>
            )}
          </div>
        )}

        <button onClick={() => router.push('/')} className="btn-back">
          ‹ to Home
        </button>
      </div>
    </div>
  );
}

export default function PartnershipStatistics() {
  return (
    <Suspense fallback={<div className="mobile-container"><div className="tournament-card mt-6"><p className="text-center text-indigo-500 text-sm">Loading…</p></div></div>}>
      <PartnershipStatisticsContent />
    </Suspense>
  );
}
