import { json } from '@sveltejs/kit';
import { listMatches } from '$lib/server/repository';

export async function GET() {
  return json(await listMatches());
}
