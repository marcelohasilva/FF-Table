<script lang="ts">
  import type { Match, Result, Squad } from '$lib/types';
  import { toLocalDateTimeInput } from '$lib/utils/format';

  export let squads: Squad[] = [];
  export let matches: Match[] = [];
  export let recentResults: Result[] = [];
  export let selectedSquadId = '';
  export let kills = 0;
  export let placement = 1;
  export let matchName = '';
  export let startedAt = toLocalDateTimeInput();
  export let saving = false;
  export let onSubmit: () => void;
  export let onDelete: (id: string) => void;
  export let onReuseMatch: (match: Match) => void;
</script>

<section class="panel">
  <div class="panel-header">
    <div>
      <p class="eyebrow">Resultados</p>
      <h2>Registrar resultado</h2>
    </div>
    <span class="counter">{recentResults.length} registros</span>
  </div>

  <form class="grid-form" on:submit|preventDefault={onSubmit}>
    <label>
      Partida
      <input bind:value={matchName} placeholder="Ex: Queda 1 - Bermuda" required />
    </label>

    <label>
      Data / hora
      <input bind:value={startedAt} type="datetime-local" required />
    </label>

    <label>
      Squad
      <select bind:value={selectedSquadId} required>
        <option value="">Selecione um squad</option>
        {#each squads as squad}
          <option value={squad.id}>{squad.name} ({squad.tag})</option>
        {/each}
      </select>
    </label>

    <label>
      Kills
      <input bind:value={kills} type="number" min="0" required />
    </label>

    <label>
      Posição
      <input bind:value={placement} type="number" min="1" max="12" required />
    </label>

    <div class="actions full-width">
      <button type="submit" disabled={saving || squads.length === 0}>Salvar resultado</button>
    </div>
  </form>

  {#if matches.length > 0}
    <div class="chips">
      {#each matches.slice(0, 5) as match}
        <button class="chip" type="button" on:click={() => onReuseMatch(match)}>{match.name}</button>
      {/each}
    </div>
  {/if}

  <div class="table-wrap compact-table">
    <table>
      <thead>
        <tr>
          <th>Partida</th>
          <th>Squad</th>
          <th>Kills</th>
          <th>Pos.</th>
          <th>Pontos</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#if recentResults.length === 0}
          <tr>
            <td colspan="6" class="empty">Cadastre um resultado para começar o ranking.</td>
          </tr>
        {:else}
          {#each recentResults as result}
            <tr>
              <td>{result.matchName}</td>
              <td>{result.squadName}</td>
              <td>{result.kills}</td>
              <td>{result.placement}º</td>
              <td>{result.points}</td>
              <td class="row-actions">
                <button class="danger" type="button" on:click={() => onDelete(result.id)}>Excluir</button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>
