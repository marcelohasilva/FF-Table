export function normalizePlayers(input: string) {
  return input
    .split(',')
    .map((player) => player.trim())
    .filter(Boolean);
}

export function formatPlayers(players: string[]) {
  return players.join(', ');
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

export function toLocalDateTimeInput(value?: string) {
  const date = value ? new Date(value) : new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[^\w\s-]/g, '')
    .trim()
    .replaceAll(/\s+/g, '-');
}
