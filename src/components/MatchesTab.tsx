'use client';

import { useState } from 'react';
import { Tournament, Match, TeamPlayer } from '@/lib/gameLogic';

interface MatchesTabProps {
  matches: Match[];
  tournament: Tournament;
  onScoreUpdate: (matchId: number, setNumber: 1 | 2, team1Score: number, team2Score: number) => Promise<void>;
}

export default function MatchesTab({ matches, tournament, onScoreUpdate }: MatchesTabProps) {
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [set1Team1Score, setSet1Team1Score] = useState('');
  const [set1Team2Score, setSet1Team2Score] = useState('');
  const [set2Team1Score, setSet2Team1Score] = useState('');
  const [set2Team2Score, setSet2Team2Score] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getPlayerName = (teamNumber: 1 | 2, playerId: number): string => {
    const players = teamNumber === 1 ? tournament.team1Players : tournament.team2Players;
    const player = players.find(p => p.id === playerId);
    return player?.name || '?';
  };

  const handleStartEdit = (match: Match) => {
    setEditingMatch(match.id);
    
    // Pre-fill existing scores if any
    if (match.set1) {
      setSet1Team1Score(match.set1.team1Score.toString());
      setSet1Team2Score(match.set1.team2Score.toString());
    } else {
      setSet1Team1Score('');
      setSet1Team2Score('');
    }
    
    if (match.set2) {
      setSet2Team1Score(match.set2.team1Score.toString());
      setSet2Team2Score(match.set2.team2Score.toString());
    } else {
      setSet2Team1Score('');
      setSet2Team2Score('');
    }
  };

  const validateBadmintonScore = (score1: number, score2: number): boolean => {
    // Both scores must be non-negative
    if (score1 < 0 || score2 < 0) return false;

    // Maximum score is 30
    if (score1 > 30 || score2 > 30) return false;

    // Someone must have won (at least one score >= 21)
    if (score1 < 21 && score2 < 21) return false;

    const winner = score1 > score2 ? score1 : score2;
    const loser = score1 > score2 ? score2 : score1;

    // If winner has 21-29 points
    if (winner < 30) {
      // Must win by at least 2 points
      if (winner - loser < 2) return false;
      // If winner is > 21, must be winning by exactly 2 (deuce situation)
      if (winner > 21 && winner - loser !== 2) return false;
    }

    // If winner has 30 points, loser must be 28 or 29
    if (winner === 30 && loser < 28) return false;

    return true;
  };

  const handleSubmit = async (matchId: number) => {
    const s1t1 = parseInt(set1Team1Score);
    const s1t2 = parseInt(set1Team2Score);
    const s2t1 = parseInt(set2Team1Score);
    const s2t2 = parseInt(set2Team2Score);

    if (isNaN(s1t1) || isNaN(s1t2)) {
      alert('Please enter valid scores for Set 1');
      return;
    }

    // Validate Set 1
    if (!validateBadmintonScore(s1t1, s1t2)) {
      alert('Invalid score');
      return;
    }

    // Validate Set 2 if entered
    if (!isNaN(s2t1) && !isNaN(s2t2)) {
      if (!validateBadmintonScore(s2t1, s2t2)) {
        alert('Invalid score');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Save Set 1
      await onScoreUpdate(matchId, 1, s1t1, s1t2);
      
      // Save Set 2 if entered
      if (!isNaN(s2t1) && !isNaN(s2t2)) {
        await onScoreUpdate(matchId, 2, s2t1, s2t2);
      }
      
      setEditingMatch(null);
      setSet1Team1Score('');
      setSet1Team2Score('');
      setSet2Team1Score('');
      setSet2Team2Score('');
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingMatch(null);
    setSet1Team1Score('');
    setSet1Team2Score('');
    setSet2Team1Score('');
    setSet2Team2Score('');
  };

  return (
    <div className="space-y-4">
      {matches.map((match, index) => (
        <div key={match.id} className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">
            Match {index + 1} - {match.matchType}
          </h3>

          {editingMatch === match.id ? (
            // EDIT MODE - Score entry form
            <div className="space-y-3">
              {/* Header row */}
              <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                <div className="flex-1">Players</div>
                <div className="w-12 text-center">Set 1</div>
                <div className="w-12 text-center">Set 2</div>
              </div>

              {/* Team 1 */}
              <div className="flex items-center gap-1 p-2 bg-blue-50 rounded min-h-[44px]">
                <span className="text-sm flex-1">
                  {getPlayerName(1, match.team1Player1Id)} / {getPlayerName(1, match.team1Player2Id)}
                </span>
                <input
                  type="number"
                  value={set1Team1Score}
                  onChange={(e) => setSet1Team1Score(e.target.value)}
                  className="w-12 h-[28px] px-1 border rounded text-center text-sm"
                  placeholder="0"
                  min="0"
                  max="30"
                />
                <input
                  type="number"
                  value={set2Team1Score}
                  onChange={(e) => setSet2Team1Score(e.target.value)}
                  className="w-12 h-[28px] px-1 border rounded text-center text-sm"
                  placeholder="0"
                  min="0"
                  max="30"
                />
              </div>

              {/* Team 2 */}
              <div className="flex items-center gap-1 p-2 bg-red-50 rounded min-h-[44px]">
                <span className="text-sm flex-1">
                  {getPlayerName(2, match.team2Player1Id)} / {getPlayerName(2, match.team2Player2Id)}
                </span>
                <input
                  type="number"
                  value={set1Team2Score}
                  onChange={(e) => setSet1Team2Score(e.target.value)}
                  className="w-12 h-[28px] px-1 border rounded text-center text-sm"
                  placeholder="0"
                  min="0"
                  max="30"
                />
                <input
                  type="number"
                  value={set2Team2Score}
                  onChange={(e) => setSet2Team2Score(e.target.value)}
                  className="w-12 h-[28px] px-1 border rounded text-center text-sm"
                  placeholder="0"
                  min="0"
                  max="30"
                />
              </div>

              {/* Submit/Cancel Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleSubmit(match.id)}
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded font-semibold disabled:bg-gray-400"
                >
                  {submitting ? 'Saving...' : 'Save Scores'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // VIEW MODE - Display scores
            <>
              {match.set1 || match.set2 ? (
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                    <div className="flex-1">Players</div>
                    <div className="w-12 text-center">Set 1</div>
                    <div className="w-12 text-center">Set 2</div>
                  </div>

                  {/* Team 1 */}
                  <div className="flex items-center gap-1 p-2 bg-blue-50 rounded min-h-[44px]">
                    <span className="text-sm flex-1">
                      {getPlayerName(1, match.team1Player1Id)} / {getPlayerName(1, match.team1Player2Id)}
                    </span>
                    <div className={`w-12 h-[28px] flex items-center justify-center font-bold text-base rounded ${match.set1?.winner === 1 ? 'bg-green-200' : ''}`}>
                      {match.set1?.team1Score ?? '-'}
                    </div>
                    <div className={`w-12 h-[28px] flex items-center justify-center font-bold text-base rounded ${match.set2?.winner === 1 ? 'bg-green-200' : ''}`}>
                      {match.set2?.team1Score ?? '-'}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center gap-1 p-2 bg-red-50 rounded min-h-[44px]">
                    <span className="text-sm flex-1">
                      {getPlayerName(2, match.team2Player1Id)} / {getPlayerName(2, match.team2Player2Id)}
                    </span>
                    <div className={`w-12 h-[28px] flex items-center justify-center font-bold text-base rounded ${match.set1?.winner === 2 ? 'bg-green-200' : ''}`}>
                      {match.set1?.team2Score ?? '-'}
                    </div>
                    <div className={`w-12 h-[28px] flex items-center justify-center font-bold text-base rounded ${match.set2?.winner === 2 ? 'bg-green-200' : ''}`}>
                      {match.set2?.team2Score ?? '-'}
                    </div>
                  </div>

                  {!tournament.isFinalized && (
                    <button
                      onClick={() => handleStartEdit(match)}
                      className="w-full bg-blue-600 text-white py-3 rounded font-semibold mt-2"
                    >
                      Edit Scores
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                    <div className="flex-1">Players</div>
                    <div className="w-12 text-center">Set 1</div>
                    <div className="w-12 text-center">Set 2</div>
                  </div>

                  <div className="flex items-center gap-1 p-2 bg-blue-50 rounded min-h-[44px]">
                    <span className="text-sm flex-1">
                      {getPlayerName(1, match.team1Player1Id)} / {getPlayerName(1, match.team1Player2Id)}
                    </span>
                    <div className="w-12 h-[28px]"></div>
                    <div className="w-12 h-[28px]"></div>
                  </div>
                  
                  <div className="flex items-center gap-1 p-2 bg-red-50 rounded min-h-[44px]">
                    <span className="text-sm flex-1">
                      {getPlayerName(2, match.team2Player1Id)} / {getPlayerName(2, match.team2Player2Id)}
                    </span>
                    <div className="w-12 h-[28px]"></div>
                    <div className="w-12 h-[28px]"></div>
                  </div>

                  <button
                    onClick={() => handleStartEdit(match)}
                    disabled={tournament.isFinalized}
                    className="w-full bg-blue-600 text-white py-3 rounded font-semibold disabled:bg-gray-400 mt-2"
                  >
                    Enter Scores
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
