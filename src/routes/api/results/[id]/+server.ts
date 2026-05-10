import { json } from '@sveltejs/kit';
import { deleteResult } from '$lib/server/repository';

export async function DELETE({ params }) {
  try {
    await deleteResult(params.id);
    return json({ success: true });
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : 'Erro ao remover resultado.' }, { status: 400 });
  }
}
