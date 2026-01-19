// VRC Tuesday - Team-Based Badminton Tournament Logic

export type PlayerGender = 'M' | 'W';
export type MatchType = 'XD' | 'MD' | 'WD';

export interface TeamPlayer {
  id: number; // 1-6 for each team
  name: string;
  gender: PlayerGender;
  teamNumber: 1 | 2; // Team 1 or Team 2
}

export interface SetScore {
  team1Score: number;
  team2Score: number;
  winner: 1 | 2 | null; // Which team won this set
}

export interface Match {
  id: number;
  matchType: MatchType;
  // Team 1 players
  team1Player1Id: number; // Player ID from Team 1
  team1Player2Id: number; // Player ID from Team 1
  // Team 2 players
  team2Player1Id: number; // Player ID from Team 2
  team2Player2Id: number; // Player ID from Team 2
  // Sets
  set1: SetScore | null;
  set2: SetScore | null;
  completed: boolean;
  matchWinner: 1 | 2 | null; // Which team won the match (best of 2 sets)
}

export interface Tournament {
  id: string;
  accessCode: string;
  date: string;
  team1Name: string;
  team2Name: string;
  team1Players: TeamPlayer[]; // 6 players: 3M, 3W
  team2Players: TeamPlayer[]; // 6 players: 3M, 3W
  matches: Match[]; // 9 matches total (3 XD, 3 MD, 3 WD)
  team1SetsWon: number;
  team2SetsWon: number;
  team1TotalPoints: number;
  team2TotalPoints: number;
  tournamentWinner: 1 | 2 | null;
  isFinalized: boolean;
  createdAt: Date;
}

/**
 * Validates a set score with deuce rules:
 * - Normal win: 21 points, opponent < 20
 * - Deuce: Must win by 2, up to 30 max
 * - At 30, that team wins regardless
 */
export function validateSetScore(score1: number, score2: number): boolean {
  if (score1 < 0 || score2 < 0 || score1 > 30 || score2 > 30) return false;
  
  // Someone must reach at least 21
  if (score1 < 21 && score2 < 21) return false;
  
  // If someone hits 30, they win
  if (score1 === 30 || score2 === 30) return true;
  
  // Normal win: 21+ with 2 point lead
  if (score1 >= 21 && score1 - score2 >= 2) return true;
  if (score2 >= 21 && score2 - score1 >= 2) return true;
  
  return false;
}

/**
 * Determines the winner of a set
 */
export function determineSetWinner(score1: number, score2: number): 1 | 2 | null {
  if (!validateSetScore(score1, score2)) return null;
  return score1 > score2 ? 1 : 2;
}

/**
 * Creates the 9 matches based on the matchup chart:
 * - 3 XD matches: W1/M1 vs W1/M1, W2/M2 vs W2/M2, W3/M3 vs W3/M3
 * - 3 MD matches: M1/M2 vs M2/M3, M2/M3 vs M1/M3, M1/M3 vs M1/M2
 * - 3 WD matches: W1/W2 vs W2/W3, W2/W3 vs W1/W3, W1/W3 vs W1/W2
 */
export function createMatches(): Match[] {
  const matches: Match[] = [];
  let matchId = 1;

  // Match 1: XD1 - W1/M1 vs W1/M1
  matches.push({
    id: matchId++,
    matchType: 'XD',
    team1Player1Id: 1, // W1
    team1Player2Id: 4, // M1
    team2Player1Id: 1, // W1
    team2Player2Id: 4, // M1
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  // Match 2: XD2 - W2/M2 vs W2/M2
  matches.push({
    id: matchId++,
    matchType: 'XD',
    team1Player1Id: 2, // W2
    team1Player2Id: 5, // M2
    team2Player1Id: 2, // W2
    team2Player2Id: 5, // M2
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  // Match 3: XD3 - W3/M3 vs W3/M3
  matches.push({
    id: matchId++,
    matchType: 'XD',
    team1Player1Id: 3, // W3
    team1Player2Id: 6, // M3
    team2Player1Id: 3, // W3
    team2Player2Id: 6, // M3
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  // Match 4: MD1 - M1/M2 vs M2/M3
  matches.push({
    id: matchId++,
    matchType: 'MD',
    team1Player1Id: 4, // M1
    team1Player2Id: 5, // M2
    team2Player1Id: 5, // M2
    team2Player2Id: 6, // M3
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  // Match 5: WD1 - W1/W2 vs W2/W3
  matches.push({
    id: matchId++,
    matchType: 'WD',
    team1Player1Id: 1, // W1
    team1Player2Id: 2, // W2
    team2Player1Id: 2, // W2
    team2Player2Id: 3, // W3
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  // Match 6: MD2 - M2/M3 vs M1/M3
  matches.push({
    id: matchId++,
    matchType: 'MD',
    team1Player1Id: 5, // M2
    team1Player2Id: 6, // M3
    team2Player1Id: 4, // M1
    team2Player2Id: 6, // M3
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  // Match 7: WD2 - W2/W3 vs W1/W3
  matches.push({
    id: matchId++,
    matchType: 'WD',
    team1Player1Id: 2, // W2
    team1Player2Id: 3, // W3
    team2Player1Id: 1, // W1
    team2Player2Id: 3, // W3
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  // Match 8: MD3 - M1/M3 vs M1/M2
  matches.push({
    id: matchId++,
    matchType: 'MD',
    team1Player1Id: 4, // M1
    team1Player2Id: 6, // M3
    team2Player1Id: 4, // M1
    team2Player2Id: 5, // M2
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  // Match 9: WD3 - W1/W3 vs W1/W2
  matches.push({
    id: matchId++,
    matchType: 'WD',
    team1Player1Id: 1, // W1
    team1Player2Id: 3, // W3
    team2Player1Id: 1, // W1
    team2Player2Id: 2, // W2
    set1: null,
    set2: null,
    completed: false,
    matchWinner: null
  });

  return matches;
}

/**
 * Creates a new tournament
 */
export function createTournament(
  accessCode: string,
  team1Name: string,
  team2Name: string,
  team1PlayerNames: string[], // [W1, W2, W3, M1, M2, M3]
  team2PlayerNames: string[], // [W1, W2, W3, M1, M2, M3]
  date?: string
): Tournament {
  const team1Players: TeamPlayer[] = team1PlayerNames.map((name, index) => ({
    id: index + 1,
    name: name.trim(),
    gender: index < 3 ? 'W' : 'M',
    teamNumber: 1
  }));

  const team2Players: TeamPlayer[] = team2PlayerNames.map((name, index) => ({
    id: index + 1,
    name: name.trim(),
    gender: index < 3 ? 'W' : 'M',
    teamNumber: 2
  }));

  return {
    id: generateTournamentId(),
    accessCode,
    date: date || (() => {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return fmt.format(now);
    })(),
    team1Name,
    team2Name,
    team1Players,
    team2Players,
    matches: createMatches(),
    team1SetsWon: 0,
    team2SetsWon: 0,
    team1TotalPoints: 0,
    team2TotalPoints: 0,
    tournamentWinner: null,
    isFinalized: false,
    createdAt: new Date()
  };
}

/**
 * Updates a match with set scores
 */
export function updateMatchScore(
  tournament: Tournament,
  matchId: number,
  setNumber: 1 | 2,
  team1Score: number,
  team2Score: number
): Tournament {
  const updatedTournament = { ...tournament };
  const match = updatedTournament.matches.find(m => m.id === matchId);

  if (!match || !validateSetScore(team1Score, team2Score)) {
    return tournament;
  }

  const setWinner = determineSetWinner(team1Score, team2Score);
  const setScore: SetScore = {
    team1Score,
    team2Score,
    winner: setWinner
  };

  if (setNumber === 1) {
    match.set1 = setScore;
  } else {
    match.set2 = setScore;
  }

  // Determine match winner if both sets are complete
  if (match.set1 && match.set2) {
    const team1Wins = [match.set1.winner, match.set2.winner].filter(w => w === 1).length;
    const team2Wins = [match.set1.winner, match.set2.winner].filter(w => w === 2).length;
    
    match.matchWinner = team1Wins > team2Wins ? 1 : 2;
    match.completed = true;
  }

  // Recalculate tournament stats
  return calculateTournamentStats(updatedTournament);
}

/**
 * Calculates overall tournament statistics
 */
export function calculateTournamentStats(tournament: Tournament): Tournament {
  let team1SetsWon = 0;
  let team2SetsWon = 0;
  let team1TotalPoints = 0;
  let team2TotalPoints = 0;

  tournament.matches.forEach(match => {
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

  // Determine winner - need at least 9 sets to win
  if (team1SetsWon >= 9 && team1SetsWon > team2SetsWon) {
    tournament.tournamentWinner = 1;
  } else if (team2SetsWon >= 9 && team2SetsWon > team1SetsWon) {
    tournament.tournamentWinner = 2;
  } else if (team1SetsWon === 9 && team2SetsWon === 9) {
    // 9-9 tie - use total points
    tournament.tournamentWinner = team1TotalPoints > team2TotalPoints ? 1 : 
                                   team2TotalPoints > team1TotalPoints ? 2 : null;
  } else {
    tournament.tournamentWinner = null;
  }

  return tournament;
}

/**
 * Checks if tournament is complete (all 18 sets scored)
 */
export function isTournamentComplete(tournament: Tournament): boolean {
  return tournament.matches.every(match => match.completed);
}

/**
 * Generates a unique tournament ID
 */
export function generateTournamentId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Gets matches by type
 */
export function getMatchesByType(tournament: Tournament, matchType: MatchType): Match[] {
  return tournament.matches.filter(m => m.matchType === matchType);
}
