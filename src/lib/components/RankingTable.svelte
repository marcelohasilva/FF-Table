<script lang="ts">
  import type { RankingEntry } from '$lib/types';

  export let ranking: RankingEntry[] = [];
  export let onExport: () => void;
</script>

<section class="panel">
  <div class="panel-header">
    <div>
      <p class="eyebrow">Ranking</p>
      <h2>Tabela em tempo real</h2>
    </div>
    <div class="actions-inline">
      <span class="counter">{ranking.length} squads</span>
      <button class="secondary" type="button" on:click={onExport}>Exportar CSV</button>
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Squad</th>
          <th>Tag</th>
          <th>Kills</th>
          <th>Pontos</th>
          <th>Partidas</th>
        </tr>
      </thead>
      <tbody>
        {#if ranking.length === 0}
          <tr>
            <td colspan="6" class="empty">Sem resultados para calcular ranking.</td>
          </tr>
        {:else}
          {#each ranking as squad, index}
            <tr class:top-one={index === 0} class:top-two={index === 1} class:top-three={index === 2}>
              <td>{index + 1}</td>
              <td>{squad.squadName}</td>
              <td>{squad.squadTag}</td>
              <td>{squad.totalKills}</td>
              <td>{squad.totalPoints}</td>
              <td>{squad.matches}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>
