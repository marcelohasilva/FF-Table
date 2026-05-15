<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title = '';
  export let map = '';
  export let time = '';
  export let status = '';
  export let teams: string[] = [];
  export let drop = 1;

  const dispatch = createEventDispatcher();
</script>

<div class="match-card">
  <div class="match-info">
    <div>
      <div class="match-title">{title}</div>
      <div class="match-meta">{map} - {time}</div>
    </div>
    {#if status}
      <span class="status-pill">{status}</span>
    {/if}
  </div>
  <div class="match-teams">
    {#each teams as team}
      <span class="team-chip" title={team}>{team.slice(0, 2).toUpperCase()}</span>
    {/each}
  </div>
  <button class="btn btn-ghost btn-small" on:click={() => dispatch('view', { drop })}>
    Ver resultados
  </button>
</div>
