'use client';

import { Tournament } from '@/lib/gameLogic';

interface ResultsTabProps {
  tournament: Tournament;
}

export default function ResultsTab({ tournament }: ResultsTabProps) {
  const getPlayerName = (teamNumber: 1 | 2, playerId: number): string => {
    const players = teamNumber === 1 ? tournament.team1Players : tournament.team2Players;
    const player = players.find(p => p.id === playerId);
    return player?.name || '?';
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* All matches in order */}
      <div className="space-y-4">
        {tournament.matches.map((match, index) => (
          <div key={match.id} className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Match {index + 1} - {match.matchType}
            </h3>

            <div className="space-y-3">
              {/* Header row */}
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <div className="flex-1 min-w-0">Players</div>
                <div className="w-16 text-center flex-shrink-0">Set 1</div>
                <div className="w-16 text-center flex-shrink-0">Set 2</div>
              </div>

              {/* Team 1 */}
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="text-sm flex-1 min-w-0 truncate">
                  {getPlayerName(1, match.team1Player1Id)} / {getPlayerName(1, match.team1Player2Id)}
                </span>
                <div className={`w-16 text-center font-bold text-lg rounded flex-shrink-0 ${match.set1?.winner === 1 ? 'bg-green-200' : ''}`}>
                  {match.set1?.team1Score ?? '-'}
                </div>
                <div className={`w-16 text-center font-bold text-lg rounded flex-shrink-0 ${match.set2?.winner === 1 ? 'bg-green-200' : ''}`}>
                  {match.set2?.team1Score ?? '-'}
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                <span className="text-sm flex-1 min-w-0 truncate">
                  {getPlayerName(2, match.team2Player1Id)} / {getPlayerName(2, match.team2Player2Id)}
                </span>
                <div className={`w-16 text-center font-bold text-lg rounded flex-shrink-0 ${match.set1?.winner === 2 ? 'bg-green-200' : ''}`}>
                  {match.set1?.team2Score ?? '-'}
                </div>
                <div className={`w-16 text-center font-bold text-lg rounded flex-shrink-0 ${match.set2?.winner === 2 ? 'bg-green-200' : ''}`}>
                  {match.set2?.team2Score ?? '-'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Rosters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Team Rosters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg min-w-0">
            <p className="font-bold text-gray-800 mb-2">{tournament.team1Name}</p>
            <div className="text-sm space-y-1">
              <p className="text-xs font-semibold text-gray-600">Women:</p>
              {tournament.team1Players.filter(p => p.gender === 'W').map(p => (
                <p key={p.id} className="text-gray-700">• {p.name}</p>
              ))}
              <p className="text-xs font-semibold text-gray-600 mt-2">Men:</p>
              {tournament.team1Players.filter(p => p.gender === 'M').map(p => (
                <p key={p.id} className="text-gray-700">• {p.name}</p>
              ))}
            </div>
          </div>

          <div className="bg-red-50 p-3 rounded-lg min-w-0">
            <p className="font-bold text-gray-800 mb-2">{tournament.team2Name}</p>
            <div className="text-sm space-y-1">
              <p className="text-xs font-semibold text-gray-600">Women:</p>
              {tournament.team2Players.filter(p => p.gender === 'W').map(p => (
                <p key={p.id} className="text-gray-700">• {p.name}</p>
              ))}
              <p className="text-xs font-semibold text-gray-600 mt-2">Men:</p>
              {tournament.team2Players.filter(p => p.gender === 'M').map(p => (
                <p key={p.id} className="text-gray-700">• {p.name}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
