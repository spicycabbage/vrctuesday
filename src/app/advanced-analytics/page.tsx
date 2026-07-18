'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatTournamentDate } from '@/lib/dates';

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

interface PlayerSummary {
  name: string;
  wins: number;
  losses: number;
  winRate: string;
}

interface PlayerDetails {
  details: PlayerDetail[];
  headToHead: HeadToHead[];
}

function AdvancedAnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || 'all';
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'h2h' | 'matches'>('h2h');
  const [detailsCache, setDetailsCache] = useState<Record<string, PlayerDetails>>({});
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
  const inflight = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDetailsCache({});
    setExpandedPlayer(null);
    inflight.current.clear();

    (async () => {
      try {
        const response = await fetch(`/api/analytics/players?year=${year}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data: PlayerSummary[] = await response.json();
        if (!cancelled) setPlayers(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [year]);

  const loadDetails = async (playerName: string) => {
    if (detailsCache[playerName] || inflight.current.has(playerName)) return;
    inflight.current.add(playerName);
    setDetailsLoading(playerName);
    try {
      const response = await fetch(
        `/api/analytics/players/${encodeURIComponent(playerName)}?year=${year}`
      );
      if (!response.ok) throw new Error('Failed to fetch player details');
      const data: PlayerDetails = await response.json();
      setDetailsCache((prev) => ({ ...prev, [playerName]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      inflight.current.delete(playerName);
      setDetailsLoading((cur) => (cur === playerName ? null : cur));
    }
  };

  const togglePlayer = (playerName: string) => {
    if (expandedPlayer === playerName) {
      setExpandedPlayer(null);
    } else {
      setExpandedPlayer(playerName);
      setViewMode('h2h');
      loadDetails(playerName);
    }
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="tournament-card mt-6">
          <p className="text-center text-gray-500 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container safe-area-inset-bottom pb-8">
      <div className="page-section-header">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800 text-2xl leading-none px-1">‹</button>
          <h1 className="text-lg font-bold text-gray-900">Advanced Analytics</h1>
          <div className="w-8" />
        </div>
        <p className="text-center text-xs text-gray-500 mt-0.5">Player records — {year === 'all' ? 'All Years' : year}</p>
      </div>

      <div className="px-4">
        {players.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">No data available yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player) => {
              const isExpanded = expandedPlayer === player.name;
              const details = detailsCache[player.name];
              const isLoadingDetails = detailsLoading === player.name && !details;

              return (
                <div key={player.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => togglePlayer(player.name)}
                    onMouseEnter={() => loadDetails(player.name)}
                    className="w-full px-4 py-3.5 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{player.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <span className="text-green-600 font-medium">{player.wins}W</span>
                          {' – '}
                          <span className="text-red-500 font-medium">{player.losses}L</span>
                          {' · '}{player.winRate}%
                        </p>
                      </div>
                      <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="flex gap-1.5 my-3">
                        <button
                          onClick={() => setViewMode('h2h')}
                          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${
                            viewMode === 'h2h'
                              ? 'bg-blue-700 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Head-to-Head
                        </button>
                        <button
                          onClick={() => setViewMode('matches')}
                          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${
                            viewMode === 'matches'
                              ? 'bg-blue-700 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Match Details
                        </button>
                      </div>

                      {isLoadingDetails || !details ? (
                        <p className="text-center text-gray-500 text-xs py-4">Loading…</p>
                      ) : viewMode === 'h2h' ? (
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600">
                            <div className="col-span-2">Opponent</div>
                            <div className="text-center">W</div>
                            <div className="text-center">L</div>
                            <div className="text-center">Win%</div>
                          </div>
                          {details.headToHead.map((h2h, idx) => {
                            const rate = parseInt(h2h.winRate);
                            const rateColor = rate >= 60 ? 'text-green-600' : rate >= 40 ? 'text-gray-700' : 'text-red-500';
                            return (
                              <div
                                key={idx}
                                className="grid grid-cols-5 gap-2 px-3 py-2.5 border-t border-gray-100 text-xs"
                              >
                                <div className="col-span-2 font-medium text-gray-900">{h2h.opponent}</div>
                                <div className="text-center font-semibold text-green-600">{h2h.wins}</div>
                                <div className="text-center font-semibold text-red-500">{h2h.losses}</div>
                                <div className={`text-center font-bold ${rateColor}`}>{h2h.winRate}%</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {details.details.map((detail, idx) => (
                            <div
                              key={idx}
                              className={`px-3 py-2.5 rounded-lg text-xs border-l-4 ${
                                detail.won ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-400'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold ${detail.won ? 'text-green-700' : 'text-red-600'}`}>
                                  {detail.won ? 'WIN' : 'LOSS'}
                                </span>
                                <span className="text-gray-400">{formatTournamentDate(detail.date)}</span>
                              </div>
                              <p className="text-gray-700">
                                <span className="font-semibold">{detail.matchType}</span> · Partner: {detail.partner}
                              </p>
                              <p className="text-gray-700 mt-0.5">vs {detail.opponents}</p>
                              <p className="text-gray-400 mt-0.5">Set {detail.setNumber || 1}: {detail.score}</p>
                            </div>
                          ))}
                        </div>
                      )}
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

export default function AdvancedAnalytics() {
  return (
    <Suspense fallback={<div className="mobile-container"><div className="tournament-card mt-6"><p className="text-center text-gray-500 text-sm">Loading…</p></div></div>}>
      <AdvancedAnalyticsContent />
    </Suspense>
  );
}
