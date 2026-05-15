<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let active = 'Dashboard';
  export let liveDrop = 1;
  export let totalDrops = 6;
  export let liveMap = 'Bermuda';
  export let liveTimeLabel = '00:00';

  const dispatch = createEventDispatcher();
  const navItems = [
    { label: 'Dashboard', icon: 'grid' },
    { label: 'Ranking Geral', icon: 'trophy' },
    { label: 'Partidas', icon: 'swords' },
    { label: 'Times', icon: 'users' },
    { label: 'Jogadores', icon: 'user' },
    { label: 'Configuracoes', icon: 'settings' }
  ];

  const icons: Record<string, string> = {
    grid: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z',
    trophy: 'M8 4h8v3a4 4 0 0 1-8 0V4zm-4 0h4v3a6 6 0 0 0 12 0V4h4v5a6 6 0 0 1-6 6h-1v3h2v3H7v-3h2v-3H8a6 6 0 0 1-6-6V4z',
    swords: 'M5 4l6 6-2 2-6-6V4h2zm10 10l6 6h-2l-6-6 2-2zm-2-8l2 2-6 6-2-2 6-6zm-4 10l2 2-6 6H3l6-6z',
    users: 'M7 7a4 4 0 1 0 0.001-0.001L7 7zm10 0a4 4 0 1 0 0.001-0.001L17 7zM4 19a5 5 0 0 1 10 0v1H4v-1zm10.5 1a6.5 6.5 0 0 1 5.5-6.4 5 5 0 0 1 4 4.9V20h-9.5z',
    user: 'M12 12a4 4 0 1 0-0.001-0.001L12 12zm-7 8a7 7 0 0 1 14 0v1H5v-1z',
    settings: 'M12 8a4 4 0 1 0 0.001-0.001L12 8zm9 4a1 1 0 0 1-1 1h-1.1a7 7 0 0 1-1.1 2.6l0.8 0.8a1 1 0 1 1-1.4 1.4l-0.8-0.8a7 7 0 0 1-2.6 1.1V20a1 1 0 1 1-2 0v-1.1a7 7 0 0 1-2.6-1.1l-0.8 0.8a1 1 0 1 1-1.4-1.4l0.8-0.8a7 7 0 0 1-1.1-2.6H4a1 1 0 1 1 0-2h1.1a7 7 0 0 1 1.1-2.6l-0.8-0.8a1 1 0 0 1 1.4-1.4l0.8 0.8a7 7 0 0 1 2.6-1.1V4a1 1 0 1 1 2 0v1.1a7 7 0 0 1 2.6 1.1l0.8-0.8a1 1 0 1 1 1.4 1.4l-0.8 0.8a7 7 0 0 1 1.1 2.6H20a1 1 0 0 1 1 1z'
  };
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <div class="brand">
      <div class="brand-badge">FF</div>
      <div>
        <div class="brand-title">FF TABLE</div>
        <div class="brand-subtitle">Painel do campeonato</div>
      </div>
    </div>
    <button class="icon-btn mobile-only" on:click={() => dispatch('close')} aria-label="Fechar menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6l-12 12" /></svg>
    </button>
  </div>

  <nav class="sidebar-nav">
    {#each navItems as item}
      <a class:active={item.label === active} href="#">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[item.icon]} /></svg>
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>

  <div class="sidebar-live">
    <div class="live-label">
      <span class="live-dot"></span>
      Queda ao vivo
    </div>
    <div class="live-title">Queda {liveDrop} / {totalDrops}</div>
    <div class="live-subtitle">{liveMap}</div>
    <div class="live-timer">
      <div class="timer-label">Tempo restante</div>
      <div class="timer-value">{liveTimeLabel}</div>
    </div>
    <button class="btn btn-primary btn-block">Assistir ao vivo</button>
    <button class="btn btn-ghost btn-block" on:click={() => dispatch('endDrop')}>Encerrar queda</button>
  </div>
</aside>
