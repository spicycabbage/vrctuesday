'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tournament, TournamentFormat } from '@/lib/gameLogic';
import ResultsTab from '@/components/ResultsTab';

function TournamentResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || 'all';
  const formatParam = searchParams.get('format');
  const initialFormat: TournamentFormat = formatParam === '8v8' ? '8v8' : '6v6';

  const [format, setFormat] = useState<TournamentFormat>(initialFormat);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setExpandedId(null);

    (async () => {
      try {
        const response = await fetch(
          `/api/tournaments/history?year=${encodeURIComponent(year)}&format=${format}`
        );
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        if (!cancelled) setTournaments(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setTournaments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year, format]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const selectFormat = (next: TournamentFormat) => {
    setFormat(next);
    const params = new URLSearchParams();
    if (year !== 'all') params.set('year', year);
    params.set('format', next);
    router.replace(`/tournament-results?${params.toString()}`, { scroll: false });
  };

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
          <h1 className="text-lg font-bold text-gray-900">Tournament History</h1>
          <div className="w-8" />
        </div>
        <p className="text-center text-xs text-gray-500 mt-0.5">
          {loading
            ? 'Loading…'
            : `${tournaments.length} ${format} tournament${tournaments.length !== 1 ? 's' : ''}${
                year === 'all' ? '' : ` in ${year}`
              }`}
        </p>
      </div>

      <div className="px-4 mb-3">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Tournament format">
          {(['6v6', '8v8'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={format === f}
              onClick={() => selectFormat(f)}
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
            <p className="text-gray-500 text-sm">Loading history…</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">
              No finalized {format} tournaments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tournaments.map((tournament) => {
              const isExpanded = expandedId === tournament.id;
              const winnerName = tournament.tournamentWinner
                ? tournament.tournamentWinner === 1
                  ? tournament.team1Name
                  : tournament.team2Name
                : 'Incomplete';

              const [y, m, d] = tournament.date.split('-').map(Number);
              const formattedDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={tournament.id}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  <button
                    onClick={() => toggleExpand(tournament.id)}
                    className="w-full px-4 py-3.5 bg-blue-800 hover:bg-blue-700 text-white transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm">{formattedDate}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏆</span>
                        <span className="font-bold text-amber-300 text-sm">{winnerName}</span>
                        <span className="text-blue-300 text-xs ml-1">
                          {tournament.team1SetsWon}–{tournament.team2SetsWon}
                        </span>
                        <span className="text-blue-400 ml-1 text-xs">
                          {isExpanded ? '▲' : '▼'}
                        </span>
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
    <Suspense
      fallback={
        <div className="mobile-container">
          <div className="tournament-card mt-6">
            <p className="text-center text-gray-500 text-sm">Loading…</p>
          </div>
        </div>
      }
    >
      <TournamentResultsContent />
    </Suspense>
  );
}
