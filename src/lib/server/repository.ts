import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import type { ChampionshipData, Match, Result, ResultInput, Squad, SquadInput } from '$lib/types';
import { calculateResultPoints } from '$lib/utils/scoring';
import { slugify } from '$lib/utils/format';
import { getFirebaseDb, hasFirebaseConfig } from '$lib/server/firebase';

const dataFile = path.resolve('data/championship.json');

const emptyData: ChampionshipData = {
  squads: [],
  matches: [],
  results: []
};

async function ensureJsonStore() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(emptyData, null, 2));
  }
}

async function readJsonData(): Promise<ChampionshipData> {
  await ensureJsonStore();
  const raw = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(raw) as ChampionshipData;
}

async function writeJsonData(data: ChampionshipData) {
  await ensureJsonStore();
  await fs.writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`);
}

async function loadData(): Promise<ChampionshipData> {
  if (!hasFirebaseConfig()) {
    return readJsonData();
  }

  const db = getFirebaseDb();
  const [squadsSnapshot, matchesSnapshot, resultsSnapshot] = await Promise.all([
    getDocs(collection(db, 'squads')),
    getDocs(collection(db, 'matches')),
    getDocs(collection(db, 'results'))
  ]);

  return {
    squads: squadsSnapshot.docs.map((item) => item.data() as Squad),
    matches: matchesSnapshot.docs.map((item) => item.data() as Match),
    results: resultsSnapshot.docs.map((item) => item.data() as Result)
  };
}

async function saveData(data: ChampionshipData) {
  if (!hasFirebaseConfig()) {
    await writeJsonData(data);
    return;
  }

  const db = getFirebaseDb();
  const collections = {
    squads: data.squads,
    matches: data.matches,
    results: data.results
  };

  for (const [name, records] of Object.entries(collections) as Array<[
    keyof ChampionshipData,
    Array<Squad | Match | Result>
  ]>) {
    const snapshot = await getDocs(collection(db, name));
    const nextIds = new Set(records.map((record) => record.id));

    await Promise.all(
      snapshot.docs
        .filter((record) => !nextIds.has(record.id))
        .map((record) => deleteDoc(doc(db, name, record.id)))
    );

    await Promise.all(records.map((record) => setDoc(doc(db, name, record.id), record)));
  }
}

function cleanSquadInput(input: SquadInput) {
  const name = input.name.trim();
  const tag = input.tag.trim().toUpperCase();
  const players = (input.players ?? []).map((player) => player.trim()).filter(Boolean);

  if (!name) {
    throw new Error('Informe o nome do squad.');
  }

  if (!tag) {
    throw new Error('Informe a tag do squad.');
  }

  return { name, tag, players };
}

function cleanResultInput(input: ResultInput) {
  const kills = Number(input.kills);
  const placement = Number(input.placement);
  const startedAt = input.startedAt ? new Date(input.startedAt).toISOString() : new Date().toISOString();
  const matchName = input.matchName.trim();

  if (!input.squadId) {
    throw new Error('Selecione um squad.');
  }

  if (!matchName) {
    throw new Error('Informe o nome da partida.');
  }

  if (!Number.isInteger(kills) || kills < 0) {
    throw new Error('Kills inválidas.');
  }

  if (!Number.isInteger(placement) || placement < 1) {
    throw new Error('Posição inválida.');
  }

  return {
    squadId: input.squadId,
    kills,
    placement,
    matchId: input.matchId?.trim(),
    matchName,
    startedAt
  };
}

function sortSquads(squads: Squad[]) {
  return [...squads].sort((left, right) => left.name.localeCompare(right.name));
}

function sortMatches(matches: Match[]) {
  return [...matches].sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

function sortResults(results: Result[]) {
  return [...results].sort(
    (left, right) =>
      right.createdAt.localeCompare(left.createdAt) ||
      left.placement - right.placement ||
      left.squadName.localeCompare(right.squadName)
  );
}

export async function listSquads() {
  const data = await loadData();
  return sortSquads(data.squads);
}

export async function createSquad(input: SquadInput) {
  const data = await loadData();
  const payload = cleanSquadInput(input);

  if (data.squads.some((squad) => squad.name.toLowerCase() === payload.name.toLowerCase())) {
    throw new Error('Já existe um squad com esse nome.');
  }

  if (data.squads.some((squad) => squad.tag.toLowerCase() === payload.tag.toLowerCase())) {
    throw new Error('Já existe um squad com essa tag.');
  }

  const now = new Date().toISOString();
  const squad: Squad = {
    id: crypto.randomUUID(),
    ...payload,
    createdAt: now,
    updatedAt: now
  };

  data.squads.push(squad);
  await saveData(data);
  return squad;
}

export async function updateSquad(id: string, input: SquadInput) {
  const data = await loadData();
  const squad = data.squads.find((item) => item.id === id);

  if (!squad) {
    throw new Error('Squad não encontrado.');
  }

  const payload = cleanSquadInput(input);

  if (data.squads.some((item) => item.id !== id && item.name.toLowerCase() === payload.name.toLowerCase())) {
    throw new Error('Já existe um squad com esse nome.');
  }

  if (data.squads.some((item) => item.id !== id && item.tag.toLowerCase() === payload.tag.toLowerCase())) {
    throw new Error('Já existe um squad com essa tag.');
  }

  squad.name = payload.name;
  squad.tag = payload.tag;
  squad.players = payload.players;
  squad.updatedAt = new Date().toISOString();

  data.results = data.results.map((result) =>
    result.squadId === id
      ? { ...result, squadName: squad.name, squadTag: squad.tag }
      : result
  );

  await saveData(data);
  return squad;
}

export async function deleteSquad(id: string) {
  const data = await loadData();
  const squad = data.squads.find((item) => item.id === id);

  if (!squad) {
    throw new Error('Squad não encontrado.');
  }

  data.squads = data.squads.filter((item) => item.id !== id);
  data.results = data.results.filter((result) => result.squadId !== id);
  const usedMatchIds = new Set(data.results.map((result) => result.matchId));
  data.matches = data.matches.filter((match) => usedMatchIds.has(match.id));
  await saveData(data);
}

export async function listMatches() {
  const data = await loadData();
  return sortMatches(data.matches);
}

export async function listResults() {
  const data = await loadData();
  return sortResults(data.results);
}

export async function createResult(input: ResultInput) {
  const data = await loadData();
  const payload = cleanResultInput(input);
  const squad = data.squads.find((item) => item.id === payload.squadId);

  if (!squad) {
    throw new Error('Squad não encontrado.');
  }

  let match = payload.matchId ? data.matches.find((item) => item.id === payload.matchId) : undefined;

  if (!match) {
    const normalizedName = slugify(payload.matchName);
    match = data.matches.find((item) => slugify(item.name) === normalizedName);
  }

  if (!match) {
    const now = new Date().toISOString();
    match = {
      id: crypto.randomUUID(),
      name: payload.matchName,
      startedAt: payload.startedAt,
      createdAt: now,
      updatedAt: now
    };
    data.matches.push(match);
  } else {
    match.name = payload.matchName;
    match.startedAt = payload.startedAt;
    match.updatedAt = new Date().toISOString();
  }

  if (data.results.some((result) => result.matchId === match.id && result.squadId === squad.id)) {
    throw new Error('Esse squad já possui resultado cadastrado para a partida.');
  }

  if (data.results.some((result) => result.matchId === match.id && result.placement === payload.placement)) {
    throw new Error('Essa posição já foi usada nesta partida.');
  }

  const now = new Date().toISOString();
  const result: Result = {
    id: crypto.randomUUID(),
    squadId: squad.id,
    squadName: squad.name,
    squadTag: squad.tag,
    kills: payload.kills,
    placement: payload.placement,
    points: calculateResultPoints(payload.placement, payload.kills),
    matchId: match.id,
    matchName: match.name,
    createdAt: now
  };

  data.results.push(result);
  await saveData(data);
  return result;
}

export async function deleteResult(id: string) {
  const data = await loadData();
  const result = data.results.find((item) => item.id === id);

  if (!result) {
    throw new Error('Resultado não encontrado.');
  }

  data.results = data.results.filter((item) => item.id !== id);
  const usedMatchIds = new Set(data.results.map((item) => item.matchId));
  data.matches = data.matches.filter((match) => usedMatchIds.has(match.id));
  await saveData(data);
}
