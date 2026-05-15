import '../styles/style.css'
import { derived, writable, get } from 'svelte/store';

import { initialTeams } from '../data/teams';
import { calculateMatchPoints, calculateRanking } from '../logic/scoring';
import type { MatchResult, RankingItem, Team } from '../logic/types';

export type Resultado = {
  teamId: string;
  teamName: string;
  kills: number;
  position: number;
  points: number;
  drop: number;
  booyah: boolean;
};

export const teams = writable<Team[]>([...initialTeams]);

export const newTeamName = writable('');
export const totalDrops = writable(6);

export const selectedTeamId = writable('');
export const newKills = writable(0);
export const newPosition = writable(1);
export const selectedDrop = writable(1);

export const results = derived(teams, ($teams) => mapTeamsToResults($teams));

export function addTeam(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  if (get(teams).some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
    alert('Equipe ja cadastrada!');
    return;
  }

  const newTeam: Team = {
    id: `t${Date.now()}`,
    name: trimmed,
    logo: trimmed.slice(0, 2).toUpperCase(),
    matches: []
  };

  teams.update((list) => [...list, newTeam]);
}

export function removeTeam(index: number) {
  const teamId = get(teams)[index]?.id;
  teams.update((list) => list.filter((_, i) => i !== index));
  if (teamId && get(selectedTeamId) === teamId) {
    selectedTeamId.set('');
  }
}

export function addMatchResults(resultsInput: Array<{ teamId: string; position: number; kills: number; drop?: number }>) {
  const total = get(totalDrops);
  if (total <= 0) return;

  const nextDrop = resultsInput[0]?.drop ?? getNextDrop(get(teams), total);
  if (nextDrop < 1 || nextDrop > total) return;

  teams.update((list) =>
    list.map((team) => {
      const result = resultsInput.find((item) => item.teamId === team.id);
      if (!result) return team;

      const updatedMatches = [...team.matches];
      updatedMatches[nextDrop - 1] = { position: result.position, kills: result.kills };

      return { ...team, matches: updatedMatches };
    })
  );
}

export function addMatchFromForm() {
  const teamId = get(selectedTeamId);
  const drop = get(selectedDrop);
  const total = get(totalDrops);
  const position = get(newPosition);
  const kills = get(newKills);

  if (!teamId) return alert('Selecione uma equipe');
  if (total === 0) return alert('Defina o total de quedas antes de adicionar resultados.');
  if (drop < 1 || drop > total) return alert('Selecione uma queda valida.');

  const currentResults = mapTeamsToResults(get(teams)).filter((r) => r.drop === drop);
  if (currentResults.some((r) => r.teamId === teamId)) {
    return alert(`Equipe ja tem resultado registrado na Queda ${drop}.`);
  }
  if (currentResults.some((r) => r.position === position)) {
    return alert(`Colocacao ${position} ja ocupada na Queda ${drop}.`);
  }

  addMatchResults([{ teamId, position, kills, drop }]);

  selectedTeamId.set('');
  newKills.set(0);
  newPosition.set(1);
  selectedDrop.set(1);
}

export function removeMatch(teamId: string, drop: number) {
  teams.update((list) =>
    list.map((team) => {
      if (team.id !== teamId) return team;
      const updatedMatches = [...team.matches];
      updatedMatches.splice(drop - 1, 1);
      return { ...team, matches: updatedMatches };
    })
  );
}

export function resetTournament() {
  if (!confirm('Tem certeza que deseja resetar o campeonato? Todos os dados serao apagados.')) return;
  teams.set([]);
  newTeamName.set('');
  selectedTeamId.set('');
  newKills.set(0);
  newPosition.set(1);
  selectedDrop.set(1);
  totalDrops.set(0);
}

export function getRanking(): RankingItem[] {
  return calculateRanking(get(teams));
}

export function getResultsByDrop() {
  const list = mapTeamsToResults(get(teams));
  const total = get(totalDrops);
  const resultsByDrop: Record<number, typeof list> = {};
  for (let i = 1; i <= total; i++) {
    resultsByDrop[i] = list.filter((r) => r.drop === i).sort((a, b) => a.position - b.position);
  }
  return resultsByDrop;
}

export function simulateMatch() {
  const list = get(teams);
  const total = get(totalDrops);
  if (list.length === 0 || total === 0) return;

  const drop = getNextDrop(list, total);
  if (drop > total) return;

  const shuffled = [...list].sort(() => Math.random() - 0.5);
  const resultsInput = shuffled.map((team, index) => ({
    teamId: team.id,
    position: index + 1,
    kills: Math.floor(Math.random() * 9),
    drop
  }));

  addMatchResults(resultsInput);
}

export function mapTeamsToResults(list: Team[]): Resultado[] {
  return list.flatMap((team) =>
    team.matches
      .map((match, index) => ({
        teamId: team.id,
        teamName: team.name,
        kills: match.kills,
        position: match.position,
        points: calculateMatchPoints(match),
        drop: index + 1,
        booyah: match.position === 1
      }))
      .filter((entry) => Number.isFinite(entry.position))
  );
}

function getNextDrop(list: Team[], total: number) {
  for (let i = 1; i <= total; i++) {
    const filled = list.filter((team) => team.matches[i - 1]).length;
    if (filled < list.length) return i;
  }
  return total + 1;
}
