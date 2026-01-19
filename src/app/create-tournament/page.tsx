'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const WOMEN_PLAYERS = ['Ivy', 'Vlo', 'Karen', 'Joanne', 'Valerie', 'Anna', 'Elisha', 'Crystal', 'Misaki'];
const MEN_PLAYERS = ['Mike', 'Clinton', 'Alex', 'Trevor', 'Justin', 'Yves', 'Anish', 'Richard'];

export default function CreateTournament() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('111');
  const [team1Name, setTeam1Name] = useState('Team A');
  const [team2Name, setTeam2Name] = useState('Team B');
  
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
  const [showDropdown, setShowDropdown] = useState<string | null>(null); // "team1-0", "team2-3", etc.
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get available players (not already selected)
  const getAvailablePlayers = (index: number, isTeam1: boolean, isWomen: boolean) => {
    const selectedPlayers = isTeam1 ? team1Players : team2Players;
    const otherTeamPlayers = isTeam1 ? team2Players : team1Players;
    const allSelected = [...selectedPlayers, ...otherTeamPlayers].filter(p => p);
    const playerList = isWomen ? WOMEN_PLAYERS : MEN_PLAYERS;
    
    return playerList.filter(name => 
      !allSelected.includes(name) || selectedPlayers[index] === name
    );
  };

  // Get filtered players based on input
  const getFilteredPlayers = (index: number, isTeam1: boolean, isWomen: boolean) => {
    const currentValue = isTeam1 ? team1Players[index] : team2Players[index];
    const available = getAvailablePlayers(index, isTeam1, isWomen);
    
    if (!currentValue) return available;
    
    return available.filter(name => 
      name.toLowerCase().startsWith(currentValue.toLowerCase())
    );
  };

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

    for (let i = 0; i < 6; i++) {
      if (!team1Players[i]) {
        setError(`Please select all Team 1 players`);
        return;
      }
      if (!team2Players[i]) {
        setError(`Please select all Team 2 players`);
        return;
      }
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
          team2Players
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

  const updateTeam1Player = (index: number, value: string) => {
    const newPlayers = [...team1Players];
    newPlayers[index] = value;
    setTeam1Players(newPlayers);
  };

  const updateTeam2Player = (index: number, value: string) => {
    const newPlayers = [...team2Players];
    newPlayers[index] = value;
    setTeam2Players(newPlayers);
  };

  const handleInputFocus = (team: number, index: number) => {
    setShowDropdown(`team${team}-${index}`);
  };

  const handleSelectPlayer = (team: number, index: number, name: string) => {
    if (team === 1) {
      updateTeam1Player(index, name);
    } else {
      updateTeam2Player(index, name);
    }
    setShowDropdown(null);
  };

  const PlayerInput = ({ 
    team, 
    index, 
    isWomen, 
    label 
  }: { 
    team: number; 
    index: number; 
    isWomen: boolean; 
    label: string;
  }) => {
    const isTeam1 = team === 1;
    const value = isTeam1 ? team1Players[index] : team2Players[index];
    const dropdownId = `team${team}-${index}`;
    const isOpen = showDropdown === dropdownId;
    const filteredPlayers = getFilteredPlayers(index, isTeam1, isWomen);

    return (
      <div className="relative" ref={isOpen ? dropdownRef : null}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (isTeam1) {
              updateTeam1Player(index, e.target.value);
            } else {
              updateTeam2Player(index, e.target.value);
            }
          }}
          onFocus={() => handleInputFocus(team, index)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
          placeholder={label}
        />
        {isOpen && filteredPlayers.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredPlayers.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelectPlayer(team, index, name)}
                className="w-full text-left px-3 py-2 hover:bg-blue-100 text-sm"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mobile-container safe-area-inset-top safe-area-inset-bottom pb-8">
      <div className="tournament-card">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create Tournament
        </h1>

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

          {/* Team 1 */}
          <div className="team-container team-1-bg">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Team 1 Name
            </label>
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-3"
              placeholder="Team name"
            />
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">Women Players</p>
              {[0, 1, 2].map((i) => (
                <PlayerInput key={i} team={1} index={i} isWomen={true} label={`W${i + 1} name`} />
              ))}
              
              <p className="text-xs font-semibold text-gray-600 mb-1 mt-3">Men Players</p>
              {[3, 4, 5].map((i) => (
                <PlayerInput key={i} team={1} index={i} isWomen={false} label={`M${i - 2} name`} />
              ))}
            </div>
          </div>

          {/* Team 2 */}
          <div className="team-container team-2-bg">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Team 2 Name
            </label>
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-3"
              placeholder="Team name"
            />
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">Women Players</p>
              {[0, 1, 2].map((i) => (
                <PlayerInput key={i} team={2} index={i} isWomen={true} label={`W${i + 1} name`} />
              ))}
              
              <p className="text-xs font-semibold text-gray-600 mb-1 mt-3">Men Players</p>
              {[3, 4, 5].map((i) => (
                <PlayerInput key={i} team={2} index={i} isWomen={false} label={`M${i - 2} name`} />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
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
