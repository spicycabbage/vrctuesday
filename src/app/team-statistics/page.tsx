'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TournamentFormat } from '@/lib/gameLogic';

interface TeamStat {
  name: string;
  wins: number;
  losses: number;
  played: number;
  winRate: string;
  setsFor: number;
  setsAgainst: number;
  pointsFor: number;
  pointsAgainst: number;
}

function TeamStatisticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || 'all';
  const [format, setFormat] = useState<TournamentFormat>('6v6');
  const [teams, setTeams] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `/api/analytics/teams?year=${encodeURIComponent(year)}&format=${format}`
        );
        if (!res.ok) throw new Error('Failed to fetch team stats');
        const data = await res.json();
        if (!cancelled) setTeams(data.teams || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setTeams([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year, format]);

  return (
    <div className="mobile-container safe-area-inset-bottom pb-8">
      <div className="page-section-header">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-2xl leading-none px-1"
          >
            ‹
          </button>
          <h1 className="text-lg font-bold text-gray-900">Team Statistics</h1>
          <div className="w-8" />
        </div>
        <p className="text-center text-xs text-gray-500 mt-0.5">
          {year === 'all' ? 'All years' : year} · by format
        </p>
      </div>

      <div className="px-4 mb-3">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Format">
          {(['6v6', '8v8'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={format === f}
              onClick={() => setFormat(f)}
              className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                format === f
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === '6v6' ? '6 vs 6' : '8 vs 8'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">Loading…</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">
              No finalized {format} tournaments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.name}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3.5"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{team.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="text-green-600 font-medium">{team.wins}W</span>
                      {' – '}
                      <span className="text-red-500 font-medium">{team.losses}L</span>
                      {' · '}
                      {team.winRate}%
                      {' · '}
                      {team.played} played
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 tabular-nums">
                    <p>
                      Sets {team.setsFor}–{team.setsAgainst}
                    </p>
                    <p className="mt-0.5">
                      Pts {team.pointsFor}–{team.pointsAgainst}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamStatisticsPage() {
  return (
    <Suspense
      fallback={
        <div className="mobile-container">
          <div className="tournament-card mt-6">
            <p className="text-center text-gray-500 text-sm">Loading…</p>
          </div>
        </div>
      }
    >
      <TeamStatisticsContent />
    </Suspense>
  );
}
