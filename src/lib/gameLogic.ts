// VRC Tuesday - Team-Based Badminton Tournament Logic

import { todayInPst, dateStringToPstDate } from './dates';

export type PlayerGender = 'M' | 'W';
export type MatchType = 'XD' | 'MD' | 'WD';
export type TournamentFormat = '6v6' | '8v8';

export interface TeamPlayer {
  id: number;
  name: string;
  gender: PlayerGender;
  teamNumber: 1 | 2;
}

export interface SetScore {
  team1Score: number;
  team2Score: number;
  winner: 1 | 2 | null;
}

export interface Match {
  id: number;
  matchType: MatchType;
  team1Player1Id: number;
  team1Player2Id: number;
  team2Player1Id: number;
  team2Player2Id: number;
  set1: SetScore | null;
  set2: SetScore | null;
  completed: boolean;
  matchWinner: 1 | 2 | null;
}

export interface Tournament {
  id: string;
  accessCode: string;
  date: string;
  format: TournamentFormat;
  team1Name: string;
  team2Name: string;
  team1Players: TeamPlayer[];
  team2Players: TeamPlayer[];
  matches: Match[];
  team1SetsWon: number;
  team2SetsWon: number;
  team1TotalPoints: number;
  team2TotalPoints: number;
  tournamentWinner: 1 | 2 | null;
  isFinalized: boolean;
  createdAt: Date;
}

export function playersPerTeam(format: TournamentFormat): number {
  return format === '8v8' ? 8 : 6;
}

export function womenCount(format: TournamentFormat): number {
  return format === '8v8' ? 4 : 3;
}

/** 6v6 plays 2 sets per match; 8v8 plays 1 set. */
export function setsPerMatch(format: TournamentFormat): number {
  return format === '8v8' ? 1 : 2;
}

function emptyMatch(
  id: number,
  matchType: MatchType,
  t1p1: number,
  t1p2: number,
  t2p1: number,
  t2p2: number
): Match {
  return {
    id,
    matchType,
    team1Player1Id: t1p1,
    team1Player2Id: t1p2,
    team2Player1Id: t2p1,
    team2Player2Id: t2p2,
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null,
  };
}

/**
 * Validates a set score with deuce rules:
 * - Normal win: 21 points, opponent < 20
 * - Deuce: Must win by 2, up to 30 max
 * - At 30, that team wins regardless
 */
export function validateSetScore(score1: number, score2: number): boolean {
  if (score1 < 0 || score2 < 0 || score1 > 30 || score2 > 30) return false;

  if (score1 < 21 && score2 < 21) return false;

  if (score1 === 30 || score2 === 30) return true;

  if (score1 >= 21 && score1 - score2 >= 2) return true;
  if (score2 >= 21 && score2 - score1 >= 2) return true;

  return false;
}

export function determineSetWinner(score1: number, score2: number): 1 | 2 | null {
  if (!validateSetScore(score1, score2)) return null;
  return score1 > score2 ? 1 : 2;
}

/**
 * 6v6 chart (3W/3M):
 * IDs: W1=1,W2=2,W3=3, M1=4,M2=5,M3=6
 * 3 XD + 3 MD + 3 WD
 */
export function createMatches6v6(): Match[] {
  const matches: Match[] = [];
  let id = 1;

  // XD same-slot
  matches.push(emptyMatch(id++, 'XD', 1, 4, 1, 4)); // W1/M1 vs W1/M1
  matches.push(emptyMatch(id++, 'XD', 2, 5, 2, 5)); // W2/M2 vs W2/M2
  matches.push(emptyMatch(id++, 'XD', 3, 6, 3, 6)); // W3/M3 vs W3/M3

  // MD/WD rotated
  matches.push(emptyMatch(id++, 'MD', 4, 5, 5, 6)); // M1/M2 vs M2/M3
  matches.push(emptyMatch(id++, 'WD', 1, 2, 2, 3)); // W1/W2 vs W2/W3
  matches.push(emptyMatch(id++, 'MD', 5, 6, 4, 6)); // M2/M3 vs M1/M3
  matches.push(emptyMatch(id++, 'WD', 2, 3, 1, 3)); // W2/W3 vs W1/W3
  matches.push(emptyMatch(id++, 'MD', 4, 6, 4, 5)); // M1/M3 vs M1/M2
  matches.push(emptyMatch(id++, 'WD', 1, 3, 1, 2)); // W1/W3 vs W1/W2

  return matches;
}

/**
 * 8v8 chart (4W/4M) from the paper matchup sheet.
 * IDs: W1=1,W2=2,W3=3,W4=4, M1=5,M2=6,M3=7,M4=8
 * 8 XD + 8 WD + 8 MD = 24 matches
 */
export function createMatches8v8(): Match[] {
  const matches: Match[] = [];
  let id = 1;

  // --- XD block 1 ---
  matches.push(emptyMatch(id++, 'XD', 1, 5, 2, 6)); // W1/M1 vs W2/M2
  matches.push(emptyMatch(id++, 'XD', 2, 6, 1, 5)); // W2/M2 vs W1/M1
  matches.push(emptyMatch(id++, 'XD', 3, 7, 4, 8)); // W3/M3 vs W4/M4
  matches.push(emptyMatch(id++, 'XD', 4, 8, 3, 7)); // W4/M4 vs W3/M3

  // --- XD block 2 ---
  matches.push(emptyMatch(id++, 'XD', 1, 7, 3, 5)); // W1/M3 vs W3/M1
  matches.push(emptyMatch(id++, 'XD', 2, 8, 4, 6)); // W2/M4 vs W4/M2
  matches.push(emptyMatch(id++, 'XD', 3, 5, 1, 7)); // W3/M1 vs W1/M3
  matches.push(emptyMatch(id++, 'XD', 4, 6, 2, 8)); // W4/M2 vs W2/M4

  // --- WD/MD same pairs ---
  matches.push(emptyMatch(id++, 'WD', 1, 2, 1, 2)); // W1/W2 vs W1/W2
  matches.push(emptyMatch(id++, 'WD', 3, 4, 3, 4)); // W3/W4 vs W3/W4
  matches.push(emptyMatch(id++, 'MD', 5, 6, 5, 6)); // M1/M2 vs M1/M2
  matches.push(emptyMatch(id++, 'MD', 7, 8, 7, 8)); // M3/M4 vs M3/M4

  // --- WD/MD crossed pairs ---
  matches.push(emptyMatch(id++, 'WD', 1, 2, 3, 4)); // W1/W2 vs W3/W4
  matches.push(emptyMatch(id++, 'WD', 3, 4, 1, 2)); // W3/W4 vs W1/W2
  matches.push(emptyMatch(id++, 'MD', 5, 6, 7, 8)); // M1/M2 vs M3/M4
  matches.push(emptyMatch(id++, 'MD', 7, 8, 5, 6)); // M3/M4 vs M1/M2

  // --- WD/MD alternate pairs ---
  matches.push(emptyMatch(id++, 'WD', 1, 3, 1, 3)); // W1/W3 vs W1/W3
  matches.push(emptyMatch(id++, 'WD', 2, 4, 2, 4)); // W2/W4 vs W2/W4
  matches.push(emptyMatch(id++, 'MD', 5, 7, 5, 7)); // M1/M3 vs M1/M3
  matches.push(emptyMatch(id++, 'MD', 6, 8, 6, 8)); // M2/M4 vs M2/M4

  // --- WD/MD remaining pairs ---
  matches.push(emptyMatch(id++, 'WD', 1, 4, 1, 4)); // W1/W4 vs W1/W4
  matches.push(emptyMatch(id++, 'WD', 2, 3, 2, 3)); // W2/W3 vs W2/W3
  matches.push(emptyMatch(id++, 'MD', 5, 8, 5, 8)); // M1/M4 vs M1/M4
  matches.push(emptyMatch(id++, 'MD', 6, 7, 6, 7)); // M2/M3 vs M2/M3

  return matches;
}

export function createMatches(format: TournamentFormat = '6v6'): Match[] {
  return format === '8v8' ? createMatches8v8() : createMatches6v6();
}

function buildPlayers(
  names: string[],
  teamNumber: 1 | 2,
  format: TournamentFormat
): TeamPlayer[] {
  const wCount = womenCount(format);
  return names.map((name, index) => ({
    id: index + 1,
    name: name.trim(),
    gender: index < wCount ? 'W' : 'M',
    teamNumber,
  }));
}

export function createTournament(
  accessCode: string,
  team1Name: string,
  team2Name: string,
  team1PlayerNames: string[],
  team2PlayerNames: string[],
  date?: string,
  format: TournamentFormat = '6v6'
): Tournament {
  const expected = playersPerTeam(format);
  if (team1PlayerNames.length !== expected || team2PlayerNames.length !== expected) {
    throw new Error(`Each team must have exactly ${expected} players for ${format}`);
  }

  return {
    id: generateTournamentId(),
    accessCode,
    date: date || todayInPst(),
    format,
    team1Name,
    team2Name,
    team1Players: buildPlayers(team1PlayerNames, 1, format),
    team2Players: buildPlayers(team2PlayerNames, 2, format),
    matches: createMatches(format),
    team1SetsWon: 0,
    team2SetsWon: 0,
    team1TotalPoints: 0,
    team2TotalPoints: 0,
    tournamentWinner: null,
    isFinalized: false,
    createdAt: date ? dateStringToPstDate(date) : dateStringToPstDate(todayInPst()),
  };
}

export function updateMatchScore(
  tournament: Tournament,
  matchId: number,
  setNumber: 1 | 2,
  team1Score: number,
  team2Score: number
): Tournament {
  const updatedTournament = { ...tournament, matches: tournament.matches.map((m) => ({ ...m })) };
  const match = updatedTournament.matches.find((m) => m.id === matchId);

  if (!match || !validateSetScore(team1Score, team2Score)) {
    return tournament;
  }

  const maxSets = setsPerMatch(tournament.format);
  if (setNumber > maxSets) {
    return tournament;
  }

  const setWinner = determineSetWinner(team1Score, team2Score);
  const setScore: SetScore = {
    team1Score,
    team2Score,
    winner: setWinner,
  };

  if (setNumber === 1) {
    match.set1 = setScore;
  } else {
    match.set2 = setScore;
  }

  syncMatchCompletion(match, tournament.format);

  return calculateTournamentStats(updatedTournament);
}

/**
 * Mark a match complete based on format (1 set for 8v8, 2 sets for 6v6).
 * Also repairs in-memory state for older 8v8 rows that had set1 but completed=false.
 */
export function syncMatchCompletion(match: Match, format: TournamentFormat): void {
  const maxSets = setsPerMatch(format);

  if (maxSets === 1) {
    if (match.set1?.winner) {
      match.matchWinner = match.set1.winner;
      match.completed = true;
      // Single-set format: ignore any accidental set2
      match.set2 = null;
    } else {
      match.matchWinner = null;
      match.completed = false;
    }
    return;
  }

  if (match.set1 && match.set2) {
    const team1Wins = [match.set1.winner, match.set2.winner].filter((w) => w === 1).length;
    const team2Wins = [match.set1.winner, match.set2.winner].filter((w) => w === 2).length;
    match.matchWinner = team1Wins > team2Wins ? 1 : 2;
    match.completed = true;
  } else {
    match.matchWinner = null;
    match.completed = false;
  }
}

export function syncTournamentMatches(tournament: Tournament): Tournament {
  for (const match of tournament.matches) {
    syncMatchCompletion(match, tournament.format);
  }
  return calculateTournamentStats(tournament);
}

/**
 * Sets needed to clinch = majority of total sets played across the tournament.
 */
export function setsToWin(tournament: Tournament): number {
  const total = tournament.matches.length * setsPerMatch(tournament.format);
  return Math.ceil(total / 2);
}

export function calculateTournamentStats(tournament: Tournament): Tournament {
  let team1SetsWon = 0;
  let team2SetsWon = 0;
  let team1TotalPoints = 0;
  let team2TotalPoints = 0;

  tournament.matches.forEach((match) => {
    if (match.set1) {
      if (match.set1.winner === 1) team1SetsWon++;
      if (match.set1.winner === 2) team2SetsWon++;
      team1TotalPoints += match.set1.team1Score;
      team2TotalPoints += match.set1.team2Score;
    }
    if (match.set2) {
      if (match.set2.winner === 1) team1SetsWon++;
      if (match.set2.winner === 2) team2SetsWon++;
      team1TotalPoints += match.set2.team1Score;
      team2TotalPoints += match.set2.team2Score;
    }
  });

  tournament.team1SetsWon = team1SetsWon;
  tournament.team2SetsWon = team2SetsWon;
  tournament.team1TotalPoints = team1TotalPoints;
  tournament.team2TotalPoints = team2TotalPoints;

  const need = setsToWin(tournament);

  if (team1SetsWon >= need && team1SetsWon > team2SetsWon) {
    tournament.tournamentWinner = 1;
  } else if (team2SetsWon >= need && team2SetsWon > team1SetsWon) {
    tournament.tournamentWinner = 2;
  } else if (team1SetsWon === need && team2SetsWon === need) {
    tournament.tournamentWinner =
      team1TotalPoints > team2TotalPoints
        ? 1
        : team2TotalPoints > team1TotalPoints
          ? 2
          : null;
  } else {
    tournament.tournamentWinner = null;
  }

  return tournament;
}

export function isTournamentComplete(tournament: Tournament): boolean {
  const synced = syncTournamentMatches({
    ...tournament,
    matches: tournament.matches.map((m) => ({ ...m })),
  });
  return synced.matches.every((match) => match.completed);
}

export function generateTournamentId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getMatchesByType(tournament: Tournament, matchType: MatchType): Match[] {
  return tournament.matches.filter((m) => m.matchType === matchType);
}

export function inferFormat(playerCount: number): TournamentFormat {
  return playerCount >= 8 ? '8v8' : '6v6';
}
