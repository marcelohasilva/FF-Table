import type { Match, RankingEntry, Result } from '$lib/types';

export const PLACEMENT_POINTS: Record<number, number> = {
  1: 12,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1
};

export function getPlacementPoints(placement: number) {
  return PLACEMENT_POINTS[placement] ?? 0;
}

export function calculateResultPoints(placement: number, kills: number) {
  return getPlacementPoints(placement) + kills;
}

export function buildRanking(results: Result[]): RankingEntry[] {
  const ranking = new Map<string, RankingEntry>();

  for (const result of results) {
    const current = ranking.get(result.squadId) ?? {
      squadId: result.squadId,
      squadName: result.squadName,
      squadTag: result.squadTag,
      totalKills: 0,
      totalPoints: 0,
      matches: 0
    };

    current.totalKills += result.kills;
    current.totalPoints += result.points;
    current.matches += 1;
    ranking.set(result.squadId, current);
  }

  return [...ranking.values()].sort(
    (left, right) =>
      right.totalPoints - left.totalPoints ||
      right.totalKills - left.totalKills ||
      left.squadName.localeCompare(right.squadName)
  );
}

export function groupResultsByMatch(matches: Match[], results: Result[]) {
  const matchMap = new Map(
    matches.map((match) => [
      match.id,
      {
        ...match,
        results: [] as Result[],
        totalKills: 0,
        totalPoints: 0
      }
    ])
  );

  for (const result of results) {
    const match = matchMap.get(result.matchId);
    if (!match) continue;
    match.results.push(result);
    match.totalKills += result.kills;
    match.totalPoints += result.points;
  }

  return [...matchMap.values()]
    .map((match) => ({
      ...match,
      results: match.results.sort((left, right) => left.placement - right.placement)
    }))
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}
