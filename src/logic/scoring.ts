import type { MatchResult, RankingItem, Team } from './types';

export const POSITION_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];

export function calculateMatchPoints(result: MatchResult): number {
  const positionPoints = result.position >= 1 && result.position <= POSITION_POINTS.length
    ? POSITION_POINTS[result.position - 1]
    : 0;
  return positionPoints + result.kills;
}

export function calculateRanking(teams: Team[]): RankingItem[] {
  const ranking = teams.map((team) => {
    const total = team.matches.reduce(
      (acc, match) => {
        const points = calculateMatchPoints(match);
        return {
          kills: acc.kills + match.kills,
          points: acc.points + points,
          matches: acc.matches + 1,
          booyah: acc.booyah + (match.position === 1 ? 1 : 0)
        };
      },
      { kills: 0, points: 0, matches: 0, booyah: 0 }
    );

    const average = total.matches > 0 ? Number((total.points / total.matches).toFixed(2)) : 0;

    return {
      id: team.id,
      name: team.name,
      logo: team.logo,
      kills: total.kills,
      points: total.points,
      matches: total.matches,
      booyah: total.booyah,
      average
    };
  });

  return ranking.sort((a, b) => b.points - a.points || b.kills - a.kills);
}
