export type Squad = {
  id: string;
  name: string;
  tag: string;
  players: string[];
  createdAt: string;
  updatedAt: string;
};

export type Match = {
  id: string;
  name: string;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Result = {
  id: string;
  squadId: string;
  squadName: string;
  squadTag: string;
  kills: number;
  placement: number;
  points: number;
  matchId: string;
  matchName: string;
  createdAt: string;
};

export type RankingEntry = {
  squadId: string;
  squadName: string;
  squadTag: string;
  totalPoints: number;
  totalKills: number;
  matches: number;
};

export type ChampionshipData = {
  squads: Squad[];
  matches: Match[];
  results: Result[];
};

export type SquadInput = {
  name: string;
  tag: string;
  players?: string[];
};

export type ResultInput = {
  squadId: string;
  kills: number;
  placement: number;
  matchId?: string;
  matchName: string;
  startedAt?: string;
};

export type OcrSuggestion = {
  squadName: string;
  kills: number;
};
