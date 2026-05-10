<script lang="ts">
  import type { Match, Result } from '$lib/types';
  import { formatDateTime } from '$lib/utils/format';
  import { groupResultsByMatch } from '$lib/utils/scoring';

  export let matches: Match[] = [];
  export let results: Result[] = [];

  $: history = groupResultsByMatch(matches, results);
</script>

<section class="panel panel-full">
  <div class="panel-header">
    <div>
      <p class="eyebrow">Histórico</p>
      <h2>Partidas jogadas</h2>
    </div>
    <span class="counter">{history.length} partidas</span>
  </div>

  {#if history.length === 0}
    <p class="empty-state">Ainda não há partidas cadastradas.</p>
  {:else}
    <div class="history-list">
      {#each history as match}
        <article class="history-card">
          <header>
            <div>
              <h3>{match.name}</h3>
              <p>{formatDateTime(match.startedAt)}</p>
            </div>
            <div class="history-metrics">
              <span>{match.results.length} squads</span>
              <span>{match.totalKills} kills</span>
            </div>
          </header>

          <div class="table-wrap compact-table">
            <table>
              <thead>
                <tr>
                  <th>Pos.</th>
                  <th>Squad</th>
                  <th>Kills</th>
                  <th>Pontos</th>
                </tr>
              </thead>
              <tbody>
                {#each match.results as result}
                  <tr>
                    <td>{result.placement}º</td>
                    <td>{result.squadName}</td>
                    <td>{result.kills}</td>
                    <td>{result.points}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</section>
