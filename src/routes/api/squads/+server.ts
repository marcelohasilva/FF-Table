import { json } from '@sveltejs/kit';
import { createSquad, listSquads } from '$lib/server/repository';

export async function GET() {
  return json(await listSquads());
}

export async function POST({ request }) {
  try {
    const squad = await createSquad(await request.json());
    return json(squad, { status: 201 });
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : 'Erro ao criar squad.' }, { status: 400 });
  }
}
