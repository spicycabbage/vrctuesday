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

  const navItems = [
    {
      href: `/tournament-results?year=${selectedYear}`,
      title: 'Tournament Results',
      desc: 'Match history & scores',
      accent: 'bg-blue-500',
      hover: 'hover:bg-blue-50/70 hover:border-blue-300',
    },
    {
      href: `/advanced-analytics?year=${selectedYear}`,
      title: 'Advanced Analytics',
      desc: 'Player win/loss & head-to-head',
      accent: 'bg-violet-500',
      hover: 'hover:bg-violet-50/70 hover:border-violet-300',
    },
    {
      href: `/partnership-statistics?year=${selectedYear}`,
      title: 'Partnership Statistics',
      desc: 'Doubles pair performance',
      accent: 'bg-emerald-500',
      hover: 'hover:bg-emerald-50/70 hover:border-emerald-300',
    },
  ];

  return (
    <div className="mobile-container safe-area-inset-bottom pb-6">
      {/* Active tournament banner or create CTA */}
      <section className="tournament-card" aria-labelledby="status-heading">
        {activeTournament ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-2.5 py-1">
                <span
                  className="block w-2 h-2 rounded-full bg-green-500 motion-safe:animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-green-800">
                  Live
                </span>
              </span>
              <h2 id="status-heading" className="sr-only">
                Active tournament
              </h2>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 mb-4">
              <p className="text-base font-semibold text-slate-900">
                {activeTournament.team1Name}
                <span className="px-1.5 text-blue-700 font-normal">vs</span>
                {activeTournament.team2Name}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Sets{' '}
                <span className="font-semibold text-slate-900 tabular-nums">
                  {activeTournament.team1SetsWon} – {activeTournament.team2SetsWon}
                </span>
              </p>
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
            <h2
              id="status-heading"
              className="text-base font-semibold text-slate-900"
            >
              Start a new tournament
            </h2>
            <p className="text-sm text-slate-600 mt-1 mb-4">
              No tournament in progress.
            </p>
            <Link href="/create-tournament" className="btn-primary">
              Create New Tournament
            </Link>
          </>
        )}
      </section>

      {/* History & Analytics */}
      <section className="tournament-card" aria-labelledby="ha-heading">
        <h2
          id="ha-heading"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3"
        >
          History &amp; Analytics
        </h2>

        <div className="mb-4">
          <label
            htmlFor="year-filter"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Filter by Year
          </label>
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <nav aria-label="History and analytics" className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group flex items-stretch gap-3 w-full pl-2 pr-3 py-3 rounded-xl border border-slate-200 bg-white transition-colors ${item.hover}`}
            >
              <span
                aria-hidden="true"
                className={`w-1.5 rounded-full ${item.accent}`}
              />
              <div className="flex-1 min-w-0 py-0.5">
                <p className="font-semibold text-sm text-slate-900">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <span
                aria-hidden="true"
                className="self-center text-slate-400 text-lg font-light group-hover:text-slate-600 transition-colors"
              >
                ›
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <p className="text-center text-slate-400 text-xs mt-2">v1.1</p>
    </div>
  );
}
