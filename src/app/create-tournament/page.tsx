'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TournamentFormat,
  playersPerTeam,
  womenCount,
} from '@/lib/gameLogic';

const WOMEN_PLAYERS = ['Ivy', 'Vlo', 'Karen', 'Joanne', 'Valerie', 'Anna', 'Elisha', 'Crystal', 'Misaki', 'Jenna', 'Steph', 'Roz', 'Lily'];
const MEN_PLAYERS = ['Mike', 'Clinton', 'Alex', 'Trevor', 'Justin', 'Yves', 'Anish', 'Richard', 'Kevin', 'Rich'];

function emptyRoster(format: TournamentFormat): string[] {
  return Array(playersPerTeam(format)).fill('');
}

function slotLabel(index: number, format: TournamentFormat): string {
  const w = womenCount(format);
  return index < w ? `W${index + 1}` : `M${index - w + 1}`;
}

export default function CreateTournament() {
  const router = useRouter();
  const [format, setFormat] = useState<TournamentFormat>('6v6');
  const [accessCode, setAccessCode] = useState('111');
  const [team1Name, setTeam1Name] = useState('Team A');
  const [team2Name, setTeam2Name] = useState('Team B');
  const [tournamentDate, setTournamentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [team1Players, setTeam1Players] = useState<string[]>(() => emptyRoster('6v6'));
  const [team2Players, setTeam2Players] = useState<string[]>(() => emptyRoster('6v6'));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const wCount = womenCount(format);
  const womenIdx = Array.from({ length: wCount }, (_, i) => i);
  const menIdx = Array.from({ length: wCount }, (_, i) => i + wCount);

  const allFieldsFilled =
    team1Players.every((p) => p && p.trim()) &&
    team2Players.every((p) => p && p.trim()) &&
    accessCode.trim();

  const switchFormat = (next: TournamentFormat) => {
    if (next === format) return;
    setFormat(next);
    setTeam1Players(emptyRoster(next));
    setTeam2Players(emptyRoster(next));
    setDuplicateWarning('');
    setError('');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        const clickedInput = Object.values(inputRefs.current).some(
          (ref) => ref && ref.contains(e.target as Node)
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

    if (!accessCode.trim()) {
      setError('Access code is required');
      return;
    }

    if (!team1Name.trim() || !team2Name.trim()) {
      setError('Team names are required');
      return;
    }

    const expected = playersPerTeam(format);
    for (let i = 0; i < expected; i++) {
      if (!team1Players[i] || !team1Players[i].trim()) {
        setError(`Please enter Team A ${slotLabel(i, format)} name`);
        return;
      }
      if (!team2Players[i] || !team2Players[i].trim()) {
        setError(`Please enter Team B ${slotLabel(i, format)} name`);
        return;
      }
    }

    const team1Names = team1Players.map((p) => p.trim().toLowerCase());
    const team2Names = team2Players.map((p) => p.trim().toLowerCase());

    if (team1Names.filter((name, index) => team1Names.indexOf(name) !== index).length > 0) {
      setError('Team A has duplicate player names');
      return;
    }

    if (team2Names.filter((name, index) => team2Names.indexOf(name) !== index).length > 0) {
      setError('Team B has duplicate player names');
      return;
    }

    if (team1Names.find((name) => team2Names.includes(name))) {
      setError('Player cannot be on both teams');
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
          date: tournamentDate,
          format,
        }),
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
    const allNames = [...team1, ...team2].map((n) => n.trim().toLowerCase()).filter((n) => n);
    const duplicates = allNames.filter((name, index) => allNames.indexOf(name) !== index);

    if (duplicates.length > 0) {
      setDuplicateWarning('⚠️ Duplicate player name detected');
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
    const selectedNames = [...team1Players, ...team2Players]
      .filter((name) => name && name.trim())
      .map((name) => name.toLowerCase());

    const availableNames = playerList.filter(
      (name) => !selectedNames.includes(name.toLowerCase())
    );

    if (!value.trim()) return availableNames;
    return availableNames.filter((name) =>
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
          ref={(el) => {
            inputRefs.current[fieldId] = el;
          }}
          type="text"
          value={value || ''}
          onChange={(e) => updateFn(index, e.target.value)}
          onFocus={() => setShowSuggestions(fieldId)}
          onBlur={() => handleBlur(team, index)}
          className={`w-full px-3 py-2 border rounded focus:outline-none text-sm ${
            isEmpty
              ? 'border-red-300 focus:border-red-500'
              : 'border-gray-300 focus:border-blue-500'
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
        <h1 className="text-lg font-bold text-center text-gray-900">Create Tournament</h1>
      </div>

      <div className="tournament-card">
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Format
          </p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tournament format">
            {(
              [
                { value: '6v6' as const, title: '(6x6)' },
                { value: '8v8' as const, title: '(8x8)' },
              ] as const
            ).map((opt) => {
              const selected = format === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => switchFormat(opt.value)}
                  className={`text-center rounded-xl border px-3 py-3 transition ${
                    selected
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/30'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                >
                  <p className="font-semibold text-sm text-slate-900">{opt.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={tournamentDate}
            onChange={(e) => setTournamentDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm text-gray-800 bg-white"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-600 uppercase tracking-wide">
              Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm text-gray-900"
              placeholder="Enter access code"
            />
          </div>

          <div className="team-container team-1-bg">
            <h3 className="text-xs font-semibold mb-3 text-gray-800 uppercase tracking-wide">Team A</h3>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 mb-1">Women</p>
              {womenIdx.map((i) => renderPlayerInput(1, i, `${slotLabel(i, format)} name`, WOMEN_PLAYERS))}
              <p className="text-xs font-semibold text-gray-500 mb-1 mt-3">Men</p>
              {menIdx.map((i) => renderPlayerInput(1, i, `${slotLabel(i, format)} name`, MEN_PLAYERS))}
            </div>
          </div>

          <div className="team-container team-2-bg">
            <h3 className="text-xs font-semibold mb-3 text-gray-800 uppercase tracking-wide">Team B</h3>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 mb-1">Women</p>
              {womenIdx.map((i) => renderPlayerInput(2, i, `${slotLabel(i, format)} name`, WOMEN_PLAYERS))}
              <p className="text-xs font-semibold text-gray-500 mb-1 mt-3">Men</p>
              {menIdx.map((i) => renderPlayerInput(2, i, `${slotLabel(i, format)} name`, MEN_PLAYERS))}
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

          <button type="button" onClick={() => router.push('/')} className="btn-back">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
