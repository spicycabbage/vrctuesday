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
      
      if (!response.ok) {
        throw new Error('Tournament not found');
      }

      const data = await response.json();
      router.push(`/tournament/${data.tournamentId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container safe-area-inset-top safe-area-inset-bottom">
      <div className="tournament-card mt-12">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Join Tournament
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Enter Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-2xl font-bold"
              placeholder="111"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Joining...' : 'Join Tournament'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
