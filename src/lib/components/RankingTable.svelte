<script lang="ts">
  export type RankingRow = {
    name: string;
    kills: number;
    points: number;
    matches: number;
    booyah: number;
    average: number;
  };

  export let rows: RankingRow[] = [];
</script>

<div class="ranking-table">
  <div class="ranking-header">
    <div>Pos</div>
    <div>Time</div>
    <div>Quedas</div>
    <div>Pontos</div>
    <div>Kills</div>
    <div>Booyah</div>
    <div>Media</div>
  </div>
  {#each rows as row, index}
    <div class={`ranking-row ${index < 3 ? `rank-${index + 1}` : ''}`}>
      <div class="rank-pos">
        <span class={`rank-chip rank-${index + 1}`}>{index + 1}</span>
      </div>
      <div class="rank-team">
        <span class="team-logo">{row.name.slice(0, 2).toUpperCase()}</span>
        <span>{row.name}</span>
      </div>
      <div>{row.matches}</div>
      <div class="rank-highlight">{row.points}</div>
      <div>{row.kills}</div>
      <div class="rank-badge">{row.booyah}</div>
      <div class="rank-media">{row.average.toFixed(2)}</div>
    </div>
  {/each}
</div>
