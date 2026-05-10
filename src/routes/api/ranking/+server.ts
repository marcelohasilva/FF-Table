import { json } from '@sveltejs/kit';
import { listResults } from '$lib/server/repository';
import { buildRanking } from '$lib/utils/scoring';

export async function GET() {
  return json(buildRanking(await listResults()));
}
