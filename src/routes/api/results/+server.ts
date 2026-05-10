import { json } from '@sveltejs/kit';
import { createResult, listResults } from '$lib/server/repository';

export async function GET() {
  return json(await listResults());
}

export async function POST({ request }) {
  try {
    const result = await createResult(await request.json());
    return json(result, { status: 201 });
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : 'Erro ao registrar resultado.' }, { status: 400 });
  }
}
