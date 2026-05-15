export type MatchResult = {
  position: number;
  kills: number;
};

export type Team = {
  id: string;
  name: string;
  logo: string;
  matches: MatchResult[];
};

export type RankingItem = {
  id: string;
  name: string;
  logo: string;
  kills: number;
  points: number;
  matches: number;
  booyah: number;
  average: number;
};
