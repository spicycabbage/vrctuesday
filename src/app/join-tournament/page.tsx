'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinTournament() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accessCode.trim()) {
      setError('Please enter an access code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/tournaments/by-code/${accessCode}`);

      if (!response.ok) throw new Error('Tournament not found');

      const data = await response.json();
      router.push(`/tournament/${data.tournamentId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container safe-area-inset-bottom">
      <div className="page-section-header">
        <h1 className="text-lg font-bold text-center text-slate-800">Join Tournament</h1>
      </div>

      <div className="tournament-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-600 uppercase tracking-wide">
              Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:border-slate-500 focus:outline-none text-center text-2xl font-bold text-slate-800 tracking-widest"
              placeholder="···"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Joining…' : 'Join Tournament'}
          </button>

          <button type="button" onClick={() => router.push('/')} className="btn-back">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
