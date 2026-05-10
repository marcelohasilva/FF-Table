<script lang="ts">
  import type { Squad } from '$lib/types';
  import { formatPlayers } from '$lib/utils/format';

  export let squads: Squad[] = [];
  export let draftName = '';
  export let draftTag = '';
  export let draftPlayers = '';
  export let editingId: string | null = null;
  export let saving = false;
  export let onSubmit: () => void;
  export let onEdit: (squad: Squad) => void;
  export let onDelete: (id: string) => void;
  export let onCancel: () => void;
</script>

<section class="panel">
  <div class="panel-header">
    <div>
      <p class="eyebrow">Squads</p>
      <h2>Cadastro de times</h2>
    </div>
    <span class="counter">{squads.length} squads</span>
  </div>

  <form class="grid-form" on:submit|preventDefault={onSubmit}>
    <label>
      Nome do squad
      <input bind:value={draftName} maxlength="40" placeholder="Ex: Fluxo" required />
    </label>

    <label>
      Tag
      <input bind:value={draftTag} maxlength="10" placeholder="FX" required />
    </label>

    <label class="full-width">
      Jogadores (opcional)
      <input bind:value={draftPlayers} placeholder="Nobru, Cerol, Level Up" />
    </label>

    <div class="actions full-width">
      <button type="submit" disabled={saving}>
        {editingId ? 'Salvar alterações' : 'Adicionar squad'}
      </button>
      {#if editingId}
        <button class="secondary" type="button" on:click={onCancel}>Cancelar</button>
      {/if}
    </div>
  </form>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Squad</th>
          <th>Tag</th>
          <th>Jogadores</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {#if squads.length === 0}
          <tr>
            <td colspan="4" class="empty">Nenhum squad cadastrado.</td>
          </tr>
        {:else}
          {#each squads as squad}
            <tr>
              <td>{squad.name}</td>
              <td><span class="tag">{squad.tag}</span></td>
              <td>{squad.players.length ? formatPlayers(squad.players) : 'Sem jogadores informados'}</td>
              <td class="row-actions">
                <button class="ghost" type="button" on:click={() => onEdit(squad)}>Editar</button>
                <button class="danger" type="button" on:click={() => onDelete(squad.id)}>Excluir</button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>
