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
      
      // Calculate head-to-head records
      const playersWithH2H = data.map((player: PlayerStats) => {
        const h2hMap: { [opponentPair: string]: { wins: number; losses: number; margins: number[] } } = {};
        
        player.details.forEach((detail) => {
          // Use the opponent pair as the key (not individual opponents)
          const opponentPair = detail.opponents;
          
          if (!h2hMap[opponentPair]) {
            h2hMap[opponentPair] = { wins: 0, losses: 0, margins: [] };
          }
          
          // Count each set once per opponent pair
          if (detail.won) {
            h2hMap[opponentPair].wins++;
          } else {
            h2hMap[opponentPair].losses++;
          }
          
          // Calculate margin
          const [s1, s2] = detail.score.split('-').map(Number);
          const margin = detail.won ? (s1 - s2) : (s2 - s1);
          h2hMap[opponentPair].margins.push(margin);
        });
        
        // Convert to array
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
      setViewMode('h2h'); // Default to h2h when opening
    }
  };

  if (loading) {
    return (
      <div className="mobile-container safe-area-inset-top">
        <div className="tournament-card mt-12">
          <p className="text-center text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container safe-area-inset-top safe-area-inset-bottom pb-8">
      <div className="bg-white shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Advanced Analytics
        </h1>
        <p className="text-center text-sm text-gray-600 mt-1">Player Win/Loss Records ({year})</p>
      </div>

      <div className="px-4">
        {players.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">No data available yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.name} className="bg-white rounded-lg shadow overflow-hidden">
                <button
                  onClick={() => togglePlayer(player.name)}
                  className="w-full p-4 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{player.name}</p>
                      <p className="text-sm text-gray-600">
                        {player.wins}W - {player.losses}L ({player.winRate}%)
                      </p>
                    </div>
                    <div className="text-2xl text-gray-400">
                      {expandedPlayer === player.name ? '−' : '+'}
                    </div>
                  </div>
                </button>

                {expandedPlayer === player.name && (
                  <div className="p-4 bg-white border-t">
                    {/* Toggle buttons */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setViewMode('h2h')}
                        className={`flex-1 py-2 rounded font-semibold text-sm ${
                          viewMode === 'h2h' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Head-to-Head
                      </button>
                      <button
                        onClick={() => setViewMode('matches')}
                        className={`flex-1 py-2 rounded font-semibold text-sm ${
                          viewMode === 'matches' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Match Details
                      </button>
                    </div>

                    {viewMode === 'h2h' ? (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-5 gap-2 p-3 bg-gray-200 text-xs font-semibold text-gray-700">
                          <div className="col-span-2">Opponent</div>
                          <div className="text-center">W</div>
                          <div className="text-center">L</div>
                          <div className="text-center">Win%</div>
                        </div>
                        {player.headToHead.map((h2h, idx) => (
                          <div 
                            key={idx} 
                            className="grid grid-cols-5 gap-2 p-3 border-b border-gray-200 text-sm"
                          >
                            <div className="col-span-2 font-semibold text-gray-800">{h2h.opponent}</div>
                            <div className="text-center font-bold text-green-600">{h2h.wins}</div>
                            <div className="text-center font-bold text-red-600">{h2h.losses}</div>
                            <div className="text-center font-bold text-green-600">{h2h.winRate}%</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {player.details.map((detail, idx) => (
                          <div 
                            key={idx} 
                            className={`p-3 rounded text-sm ${
                              detail.won ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`font-bold ${detail.won ? 'text-green-700' : 'text-red-700'}`}>
                                {detail.won ? 'WIN' : 'LOSS'}
                              </span>
                              <span className="text-xs text-gray-600">{detail.date}</span>
                            </div>
                            <p className="text-xs text-gray-700">
                              <span className="font-semibold">{detail.matchType}</span> • Partner: {detail.partner}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              vs {detail.opponents}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Set {(detail as any).setNumber || 1}: {detail.score}
                            </p>
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

export default function AdvancedAnalytics() {
  return (
    <Suspense fallback={<div className="mobile-container safe-area-inset-top safe-area-inset-bottom"><div className="tournament-card mt-12"><p className="text-center text-gray-600">Loading...</p></div></div>}>
      <AdvancedAnalyticsContent />
    </Suspense>
  );
}
