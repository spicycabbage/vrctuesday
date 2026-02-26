'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PlayerDetail {
  won: boolean;
  matchType: string;
  partner: string;
  opponents: string;
  score: string;
  date: string;
  opponent1: string;
  opponent2: string;
  team1Score: number;
  team2Score: number;
  setNumber?: number;
}

interface HeadToHead {
  opponent: string;
  wins: number;
  losses: number;
  winRate: string;
  margin: string;
}

interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  winRate: string;
  details: PlayerDetail[];
  headToHead: HeadToHead[];
}

function AdvancedAnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || 'all';
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'h2h' | 'matches'>('h2h');

  useEffect(() => {
    fetchAnalytics();
  }, [year]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/players?year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();

      const playersWithH2H = data.map((player: PlayerStats) => {
        const h2hMap: { [opponentPair: string]: { wins: number; losses: number; margins: number[] } } = {};

        player.details.forEach((detail) => {
          // Normalize opponent pair order so "A / B" and "B / A" map to the same key
          const opponentPair = detail.opponents
            .split(' / ')
            .sort()
            .join(' / ');

          if (!h2hMap[opponentPair]) {
            h2hMap[opponentPair] = { wins: 0, losses: 0, margins: [] };
          }

          if (detail.won) {
            h2hMap[opponentPair].wins++;
          } else {
            h2hMap[opponentPair].losses++;
          }

          const [s1, s2] = detail.score.split('-').map(Number);
          const margin = detail.won ? (s1 - s2) : (s2 - s1);
          h2hMap[opponentPair].margins.push(margin);
        });

        const headToHead = Object.entries(h2hMap).map(([opponent, stats]) => {
          const total = stats.wins + stats.losses;
          const avgMargin = stats.margins.reduce((a, b) => a + b, 0) / stats.margins.length;
          return {
            opponent,
            wins: stats.wins,
            losses: stats.losses,
            winRate: total > 0 ? ((stats.wins / total) * 100).toFixed(0) : '0',
            margin: avgMargin > 0 ? `+${avgMargin.toFixed(1)}` : avgMargin.toFixed(1)
          };
        }).sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));

        return { ...player, headToHead };
      });

      setPlayers(playersWithH2H);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const togglePlayer = (playerName: string) => {
    if (expandedPlayer === playerName) {
      setExpandedPlayer(null);
    } else {
      setExpandedPlayer(playerName);
      setViewMode('h2h');
    }
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="tournament-card mt-6">
          <p className="text-center text-indigo-500 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container safe-area-inset-bottom pb-8">
      <div className="page-section-header">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-indigo-500 hover:text-indigo-700 text-2xl leading-none px-1">‹</button>
          <h1 className="text-lg font-bold text-indigo-900">Advanced Analytics</h1>
          <div className="w-16" />
        </div>
        <p className="text-center text-xs text-indigo-500 mt-0.5">Player records — {year === 'all' ? 'All Years' : year}</p>
      </div>

      <div className="px-4">
        {players.length === 0 ? (
          <div className="bg-white rounded-xl border border-indigo-200 p-6 text-center">
            <p className="text-indigo-500 text-sm">No data available yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.name} className="bg-white rounded-xl border border-indigo-200 overflow-hidden">
                <button
                  onClick={() => togglePlayer(player.name)}
                  className="w-full px-4 py-3.5 hover:bg-indigo-50 transition text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-indigo-900">{player.name}</p>
                      <p className="text-xs text-indigo-500 mt-0.5">
                        <span className="text-green-600 font-medium">{player.wins}W</span>
                        {' – '}
                        <span className="text-red-500 font-medium">{player.losses}L</span>
                        {' · '}{player.winRate}%
                      </p>
                    </div>
                    <span className="text-indigo-400 text-sm">{expandedPlayer === player.name ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedPlayer === player.name && (
                  <div className="px-4 pb-4 border-t border-indigo-100">
                    <div className="flex gap-1.5 my-3">
                      <button
                        onClick={() => setViewMode('h2h')}
                        className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${
                          viewMode === 'h2h'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        Head-to-Head
                      </button>
                      <button
                        onClick={() => setViewMode('matches')}
                        className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${
                          viewMode === 'matches'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        Match Details
                      </button>
                    </div>

                    {viewMode === 'h2h' ? (
                      <div className="rounded-lg overflow-hidden border border-indigo-200">
                        <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-indigo-100 text-xs font-semibold text-indigo-700">
                          <div className="col-span-2">Opponent</div>
                          <div className="text-center">W</div>
                          <div className="text-center">L</div>
                          <div className="text-center">Win%</div>
                        </div>
                        {player.headToHead.map((h2h, idx) => {
                          const rate = parseInt(h2h.winRate);
                          const rateColor = rate >= 60 ? 'text-green-600' : rate >= 40 ? 'text-indigo-700' : 'text-red-500';
                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-5 gap-2 px-3 py-2.5 border-t border-indigo-100 text-xs"
                            >
                              <div className="col-span-2 font-medium text-indigo-900">{h2h.opponent}</div>
                              <div className="text-center font-semibold text-green-600">{h2h.wins}</div>
                              <div className="text-center font-semibold text-red-500">{h2h.losses}</div>
                              <div className={`text-center font-bold ${rateColor}`}>{h2h.winRate}%</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {player.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-2.5 rounded-lg text-xs border-l-4 ${
                              detail.won
                                ? 'bg-green-50 border-green-500'
                                : 'bg-red-50 border-red-400'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`font-bold text-xs ${detail.won ? 'text-green-700' : 'text-red-600'}`}>
                                {detail.won ? 'WIN' : 'LOSS'}
                              </span>
                              <span className="text-indigo-400">{detail.date}</span>
                            </div>
                            <p className="text-indigo-700">
                              <span className="font-semibold">{detail.matchType}</span> · Partner: {detail.partner}
                            </p>
                            <p className="text-indigo-700 mt-0.5">vs {detail.opponents}</p>
                            <p className="text-indigo-400 mt-0.5">Set {(detail as any).setNumber || 1}: {detail.score}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={() => router.push('/')} className="btn-back mt-6">
          ‹ to Home
        </button>
      </div>
    </div>
  );
}

export default function AdvancedAnalytics() {
  return (
    <Suspense fallback={<div className="mobile-container"><div className="tournament-card mt-6"><p className="text-center text-indigo-500 text-sm">Loading…</p></div></div>}>
      <AdvancedAnalyticsContent />
    </Suspense>
  );
}
