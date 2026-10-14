
export interface Member {
  id: string;
  name: string;
  avatar: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[]; // member ids
  points: number;
  color: string;
}

export interface Game {
  id: string;
  name: string;
  type: 'time-based' | 'points-only' | 'mixed';
  description: string;
  scoreMetric?: string; // e.g. "Baubles caught"
}

export interface GameHistory {
  gameId: string;
  teamId: string;
  points: number;
  timeSpent?: number; // in seconds
  numericScore?: number; // the metric value
  timestamp: number;
}

export type View = 'setup' | 'teams' | 'games' | 'play' | 'scoreboard' | 'podium';

export interface RoundResult {
  teamId: string;
  score: number; // can be points or seconds
  secondaryScore?: number;
}

export interface TeamDuelStats {
  teamId: string;
  laps: number[]; // timestamps of each lap
  finished: boolean;
  numericScore?: number;
}
