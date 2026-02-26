'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Check if all fields are filled
  const allFieldsFilled = team1Players.every(p => p && p.trim()) && 
                          team2Players.every(p => p && p.trim()) && 
                          accessCode.trim();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        // Check if click is on any input
        const clickedInput = Object.values(inputRefs.current).some(
          ref => ref && ref.contains(e.target as Node)
        );
        if (!clickedInput) {
          setShowSuggestions(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // Keep the value as-is while typing, only trim on blur
    newPlayers[index] = value;
    setTeam1Players(newPlayers);
    checkDuplicates(newPlayers, team2Players);
  };

  const updateTeam2Player = (index: number, value: string) => {
    const newPlayers = [...team2Players];
    // Keep the value as-is while typing, only trim on blur
    newPlayers[index] = value;
    setTeam2Players(newPlayers);
    checkDuplicates(team1Players, newPlayers);
  };

  const handleBlur = (team: 1 | 2, index: number) => {
    if (team === 1) {
      const newPlayers = [...team1Players];
      newPlayers[index] = newPlayers[index].trim();
      setTeam1Players(newPlayers);
    } else {
      const newPlayers = [...team2Players];
      newPlayers[index] = newPlayers[index].trim();
      setTeam2Players(newPlayers);
    }
  };

  const getSuggestions = (value: string, playerList: string[]) => {
    // Get all selected names from both teams
    const selectedNames = [...team1Players, ...team2Players]
      .filter(name => name && name.trim())
      .map(name => name.toLowerCase());
    
    // Filter out already selected names
    const availableNames = playerList.filter(name => 
      !selectedNames.includes(name.toLowerCase())
    );
    
    if (!value.trim()) return availableNames;
    return availableNames.filter(name => 
      name.toLowerCase().startsWith(value.toLowerCase())
    );
  };

  const renderPlayerInput = (
    team: 1 | 2,
    index: number,
    label: string,
    playerList: string[]
  ) => {
    const fieldId = `team${team}-${index}`;
    const value = team === 1 ? team1Players[index] : team2Players[index];
    const updateFn = team === 1 ? updateTeam1Player : updateTeam2Player;
    const suggestions = getSuggestions(value, playerList);
    const isOpen = showSuggestions === fieldId;
    const isEmpty = !value || !value.trim();

    return (
      <div key={index} className="relative">
        <input
          ref={el => { inputRefs.current[fieldId] = el; }}
          type="text"
          value={value || ''}
          onChange={(e) => updateFn(index, e.target.value)}
          onFocus={() => setShowSuggestions(fieldId)}
          onBlur={() => handleBlur(team, index)}
          className={`w-full px-3 py-2 border rounded focus:outline-none text-sm ${
            isEmpty ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder={label}
          autoComplete="off"
        />
        {isOpen && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  updateFn(index, name);
                  setShowSuggestions(null);
                }}
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
    <div className="mobile-container safe-area-inset-bottom pb-8">
      <div className="page-section-header">
        <h1 className="text-lg font-bold text-center text-indigo-900">Create Tournament</h1>
      </div>

      <div className="tournament-card">
        <div className="flex items-center justify-between mb-5">
          <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={tournamentDate}
            onChange={(e) => setTournamentDate(e.target.value)}
            className="px-3 py-2 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-indigo-800 bg-white"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-indigo-600 uppercase tracking-wide">
              Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-indigo-900"
              placeholder="Enter access code"
            />
          </div>

          <div className="team-container team-1-bg">
            <h3 className="text-xs font-semibold mb-3 text-indigo-800 uppercase tracking-wide">Team A</h3>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-indigo-500 mb-1">Women</p>
              {[0, 1, 2].map((i) => renderPlayerInput(1, i, `W${i + 1} name`, WOMEN_PLAYERS))}
              <p className="text-xs font-semibold text-indigo-500 mb-1 mt-3">Men</p>
              {[3, 4, 5].map((i) => renderPlayerInput(1, i, `M${i - 2} name`, MEN_PLAYERS))}
            </div>
          </div>

          <div className="team-container team-2-bg">
            <h3 className="text-xs font-semibold mb-3 text-indigo-800 uppercase tracking-wide">Team B</h3>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-indigo-500 mb-1">Women</p>
              {[0, 1, 2].map((i) => renderPlayerInput(2, i, `W${i + 1} name`, WOMEN_PLAYERS))}
              <p className="text-xs font-semibold text-indigo-500 mb-1 mt-3">Men</p>
              {[3, 4, 5].map((i) => renderPlayerInput(2, i, `M${i - 2} name`, MEN_PLAYERS))}
            </div>
          </div>

          {duplicateWarning && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2.5 rounded-lg text-sm">
              {duplicateWarning}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!duplicateWarning || !allFieldsFilled}
            className="btn-primary"
          >
            {loading ? 'Creating…' : 'Create Tournament'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn-back"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
