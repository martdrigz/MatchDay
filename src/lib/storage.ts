import { Player, Match, PlayerStats } from '../types';

export const getPlayers = (): Player[] => {
  try {
    const data = localStorage.getItem('matchday_players');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse players from local storage', e);
    return [];
  }
};

export const savePlayers = (players: Player[]) => {
  localStorage.setItem('matchday_players', JSON.stringify(players));
};

export const getMatches = (): Match[] => {
  try {
    const data = localStorage.getItem('matchday_matches');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse matches from local storage', e);
    return [];
  }
};

export const saveMatches = (matches: Match[]) => {
  localStorage.setItem('matchday_matches', JSON.stringify(matches));
};

export const saveMatch = (match: Match) => {
  const matches = getMatches();
  const existingIndex = matches.findIndex(m => m.id === match.id);
  if (existingIndex >= 0) {
    matches[existingIndex] = match;
  } else {
    matches.push(match);
  }
  saveMatches(matches);
};

export const deleteMatch = (id: string) => {
  const matches = getMatches();
  saveMatches(matches.filter(m => m.id !== id));
}

// Compute stats based on completed matches
export const getPlayerStats = (): PlayerStats[] => {
  const players = getPlayers();
  const matches = getMatches().filter(m => m.status === 'completed');
  
  const statsMap: Record<string, PlayerStats> = {};
  
  players.forEach(p => {
    statsMap[p.id] = {
      playerId: p.id,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  });
  
  matches.forEach(m => {
    const aGoals = m.result?.teamAGoals ?? 0;
    const bGoals = m.result?.teamBGoals ?? 0;
    
    // Check if player in Team A
    m.teamA.players.forEach(p => {
      if (!statsMap[p.id]) return;
      statsMap[p.id].matchesPlayed++;
      if (aGoals > bGoals) statsMap[p.id].wins++;
      else if (aGoals < bGoals) statsMap[p.id].losses++;
      else statsMap[p.id].draws++;
    });
    
    // Check if player in Team B
    m.teamB.players.forEach(p => {
      if (!statsMap[p.id]) return;
      statsMap[p.id].matchesPlayed++;
      if (bGoals > aGoals) statsMap[p.id].wins++;
      else if (bGoals < aGoals) statsMap[p.id].losses++;
      else statsMap[p.id].draws++;
    });
  });
  
  return Object.values(statsMap);
};
