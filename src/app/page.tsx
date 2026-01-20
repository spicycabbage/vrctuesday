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
    // Load both in parallel without blocking UI
    Promise.all([
      fetch('/api/tournaments').then(res => res.ok ? res.json() : null).catch(() => null),
      fetch('/api/tournaments/years').then(res => res.ok ? res.json() : []).catch(() => [])
    ]).then(([tournament, years]) => {
      if (tournament) setActiveTournament(tournament);
      setAvailableYears(years);
    });
  }, []);

  return (
    <div className="mobile-container safe-area-inset-top safe-area-inset-bottom pb-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center my-4 md:my-8 text-gray-800">
        VRC Tuesday
      </h1>

      {activeTournament ? (
        // Active Tournament Card
        <div className="tournament-card mb-4">
          <button
            onClick={() => router.push(`/tournament/${activeTournament.id}`)}
            className="block w-full bg-black text-white text-center py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Tournament in Progress - Join
          </button>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-semibold text-gray-700">{activeTournament.team1Name} vs {activeTournament.team2Name}</p>
            <p className="text-xs text-gray-600 mt-1">Score: {activeTournament.team1SetsWon} - {activeTournament.team2SetsWon}</p>
          </div>
        </div>
      ) : (
        // Create Tournament Card
        <div className="tournament-card mb-4">
          <Link 
            href="/create-tournament"
            className="block w-full bg-black text-white text-center py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Create New Tournament
          </Link>
        </div>
      )}

      {/* Historical/Analytics Card */}
      <div className="tournament-card">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Filter by Year</h2>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full p-3 mb-4 border-2 border-gray-300 rounded-lg bg-gray-100 text-lg font-semibold"
        >
          <option value="all">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <Link 
          href={`/tournament-results?year=${selectedYear}`}
          className="block w-full bg-blue-500 text-white text-center py-4 rounded-lg font-semibold hover:bg-blue-600 transition mb-3"
        >
          View Tournament Results
        </Link>

        <Link 
          href={`/advanced-analytics?year=${selectedYear}`}
          className="block w-full bg-purple-500 text-white text-center py-4 rounded-lg font-semibold hover:bg-purple-600 transition mb-3"
        >
          Advanced Analytics
        </Link>

        <button 
          onClick={() => router.push(`/partnership-statistics?year=${selectedYear}`)}
          className="block w-full bg-orange-500 text-white text-center py-4 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Partnership Statistics
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">Version 1.1</p>
    </div>
  );
}
