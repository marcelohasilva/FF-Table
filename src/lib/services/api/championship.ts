import type { Match, RankingEntry, Result, ResultInput, Squad, SquadInput } from '$lib/types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? 'Não foi possível concluir a operação.');
  }

  return (await response.json()) as T;
}

export const championshipApi = {
  listSquads: () => request<Squad[]>('/api/squads'),
  createSquad: (payload: SquadInput) =>
    request<Squad>('/api/squads', { method: 'POST', body: JSON.stringify(payload) }),
  updateSquad: (id: string, payload: SquadInput) =>
    request<Squad>(`/api/squads/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteSquad: (id: string) => request<{ success: true }>(`/api/squads/${id}`, { method: 'DELETE' }),
  listResults: () => request<Result[]>('/api/results'),
  createResult: (payload: ResultInput) =>
    request<Result>('/api/results', { method: 'POST', body: JSON.stringify(payload) }),
  deleteResult: (id: string) => request<{ success: true }>(`/api/results/${id}`, { method: 'DELETE' }),
  listMatches: () => request<Match[]>('/api/matches'),
  getRanking: () => request<RankingEntry[]>('/api/ranking')
};
