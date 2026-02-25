'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [activeTournament, setActiveTournament] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/tournaments').then(res => res.ok ? res.json() : null).catch(() => null),
      fetch('/api/tournaments/years').then(res => res.ok ? res.json() : []).catch(() => [])
    ]).then(([tournament, years]) => {
      if (tournament) setActiveTournament(tournament);
      setAvailableYears(years);
    });
  }, []);

  return (
    <div className="mobile-container safe-area-inset-bottom pb-6">

      {/* Active tournament banner or create CTA */}
      <div className="tournament-card">
        {activeTournament ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Live Tournament</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 text-sm text-slate-700">
              <p className="font-semibold">{activeTournament.team1Name} vs {activeTournament.team2Name}</p>
              <p className="text-slate-500 mt-0.5">Score: {activeTournament.team1SetsWon} – {activeTournament.team2SetsWon}</p>
            </div>
            <button
              onClick={() => router.push(`/tournament/${activeTournament.id}`)}
              className="btn-primary"
            >
              Rejoin Tournament
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3">No active tournament</p>
            <Link href="/create-tournament" className="btn-primary">
              Create New Tournament
            </Link>
          </>
        )}
      </div>

      {/* History & Analytics */}
      <div className="tournament-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">History & Analytics</h2>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Filter by Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <nav className="space-y-2">
          <Link
            href={`/tournament-results?year=${selectedYear}`}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
          >
            <div>
              <p className="font-semibold text-sm text-slate-800">Tournament Results</p>
              <p className="text-xs text-slate-500 mt-0.5">Match history & scores</p>
            </div>
            <span className="text-slate-400 text-lg">›</span>
          </Link>

          <Link
            href={`/advanced-analytics?year=${selectedYear}`}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
          >
            <div>
              <p className="font-semibold text-sm text-slate-800">Advanced Analytics</p>
              <p className="text-xs text-slate-500 mt-0.5">Player win/loss & head-to-head</p>
            </div>
            <span className="text-slate-400 text-lg">›</span>
          </Link>

          <button
            onClick={() => router.push(`/partnership-statistics?year=${selectedYear}`)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left"
          >
            <div>
              <p className="font-semibold text-sm text-slate-800">Partnership Statistics</p>
              <p className="text-xs text-slate-500 mt-0.5">Doubles pair performance</p>
            </div>
            <span className="text-slate-400 text-lg">›</span>
          </button>
        </nav>
      </div>

      <p className="text-center text-slate-400 text-xs mt-2">v1.1</p>
    </div>
  );
}
