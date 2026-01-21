'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const WOMEN_PLAYERS = ['Ivy', 'Vlo', 'Karen', 'Joanne', 'Valerie', 'Anna', 'Elisha', 'Crystal', 'Misaki', 'Jenna'];
const MEN_PLAYERS = ['Mike', 'Clinton', 'Alex', 'Trevor', 'Justin', 'Yves', 'Anish', 'Richard'];

export default function CreateTournament() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('111');
  const [team1Name, setTeam1Name] = useState('Team A');
  const [team2Name, setTeam2Name] = useState('Team B');
  const [tournamentDate, setTournamentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Team 1 players: W1, W2, W3, M1, M2, M3
  const [team1Players, setTeam1Players] = useState<string[]>([
    '', '', '', '', '', ''
  ]);
  
  // Team 2 players: W1, W2, W3, M1, M2, M3
  const [team2Players, setTeam2Players] = useState<string[]>([
    '', '', '', '', '', ''
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!accessCode.trim()) {
      setError('Access code is required');
      return;
    }

    if (!team1Name.trim() || !team2Name.trim()) {
      setError('Team names are required');
      return;
    }

    // Validate all player names are filled and not just whitespace
    for (let i = 0; i < 6; i++) {
      if (!team1Players[i] || !team1Players[i].trim()) {
        const label = i < 3 ? `W${i + 1}` : `M${i - 2}`;
        setError(`Please enter Team A ${label} name`);
        return;
      }
      if (!team2Players[i] || !team2Players[i].trim()) {
        const label = i < 3 ? `W${i + 1}` : `M${i - 2}`;
        setError(`Please enter Team B ${label} name`);
        return;
      }
    }

    // Check for duplicate names within each team
    const team1Names = team1Players.map(p => p.trim().toLowerCase());
    const team2Names = team2Players.map(p => p.trim().toLowerCase());
    
    const team1Duplicates = team1Names.filter((name, index) => team1Names.indexOf(name) !== index);
    if (team1Duplicates.length > 0) {
      setError(`Team A has duplicate player names`);
      return;
    }
    
    const team2Duplicates = team2Names.filter((name, index) => team2Names.indexOf(name) !== index);
    if (team2Duplicates.length > 0) {
      setError(`Team B has duplicate player names`);
      return;
    }

    // Check for same player on both teams
    const duplicateAcrossTeams = team1Names.find(name => team2Names.includes(name));
    if (duplicateAcrossTeams) {
      setError(`Player cannot be on both teams`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode,
          team1Name,
          team2Name,
          team1Players,
          team2Players,
          date: tournamentDate
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tournament');
      }

      const data = await response.json();
      router.push(`/tournament/${data.tournamentId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const checkDuplicates = (team1: string[], team2: string[]) => {
    const allNames = [...team1, ...team2].map(n => n.trim().toLowerCase()).filter(n => n);
    const duplicates = allNames.filter((name, index) => allNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      setDuplicateWarning(`⚠️ Duplicate player name detected`);
    } else {
      setDuplicateWarning('');
    }
  };

  const updateTeam1Player = (index: number, value: string) => {
    const newPlayers = [...team1Players];
    newPlayers[index] = value;
    setTeam1Players(newPlayers);
    checkDuplicates(newPlayers, team2Players);
  };

  const updateTeam2Player = (index: number, value: string) => {
    const newPlayers = [...team2Players];
    newPlayers[index] = value;
    setTeam2Players(newPlayers);
    checkDuplicates(team1Players, newPlayers);
  };


  return (
    <div className="mobile-container safe-area-inset-top safe-area-inset-bottom pb-8">
      <div className="tournament-card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            Create Tournament
          </h1>
          <input
            type="date"
            value={tournamentDate}
            onChange={(e) => setTournamentDate(e.target.value)}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Access Code */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter access code"
            />
          </div>

          {/* Team 1 - Team A (fixed name) */}
          <div className="team-container team-1-bg">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Team A</h3>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">Women Players</p>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={team1Players[i] || ''}
                  onChange={(e) => updateTeam1Player(i, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  placeholder={`W${i + 1} name`}
                  autoComplete="off"
                />
              ))}
              
              <p className="text-xs font-semibold text-gray-600 mb-1 mt-3">Men Players</p>
              {[3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={team1Players[i] || ''}
                  onChange={(e) => updateTeam1Player(i, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  placeholder={`M${i - 2} name`}
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          {/* Team 2 - Team B (fixed name) */}
          <div className="team-container team-2-bg">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Team B</h3>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">Women Players</p>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={team2Players[i] || ''}
                  onChange={(e) => updateTeam2Player(i, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  placeholder={`W${i + 1} name`}
                  autoComplete="off"
                />
              ))}
              
              <p className="text-xs font-semibold text-gray-600 mb-1 mt-3">Men Players</p>
              {[3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={team2Players[i] || ''}
                  onChange={(e) => updateTeam2Player(i, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  placeholder={`M${i - 2} name`}
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          {duplicateWarning && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
              {duplicateWarning}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!duplicateWarning}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Tournament'}
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
