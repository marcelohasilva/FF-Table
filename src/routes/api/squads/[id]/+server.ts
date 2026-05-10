import { json } from '@sveltejs/kit';
import { deleteSquad, updateSquad } from '$lib/server/repository';

export async function PUT({ params, request }) {
  try {
    const squad = await updateSquad(params.id, await request.json());
    return json(squad);
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : 'Erro ao atualizar squad.' }, { status: 400 });
  }
}

export async function DELETE({ params }) {
  try {
    await deleteSquad(params.id);
    return json({ success: true });
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : 'Erro ao remover squad.' }, { status: 400 });
  }
}
