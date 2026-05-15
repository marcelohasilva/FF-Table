<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title = 'Campeonato X';
  export let subtitle = 'Squad - 12 equipes - 6 quedas';
  export let live = true;

  const dispatch = createEventDispatcher();
</script>

<header class="header">
  <div class="header-left">
    <button class="icon-btn mobile-only" on:click={() => dispatch('toggle')} aria-label="Abrir menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
    </button>
    <div>
      <div class="header-title">{title}</div>
      <div class="header-subtitle">
        {subtitle}
        {#if live}
          <span class="live-badge">AO VIVO</span>
        {/if}
      </div>
    </div>
  </div>

  <div class="header-actions">
    <button class="icon-btn" aria-label="Notificacoes">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a5 5 0 0 1 5 5v2.2c0 1.2.4 2.3 1.1 3.2l1.3 1.7c.4.5.1 1.2-.6 1.2H5.2c-.7 0-1-.7-.6-1.2l1.3-1.7c.7-.9 1.1-2 1.1-3.2V8a5 5 0 0 1 5-5zm0 18a2.5 2.5 0 0 0 2.3-1.5H9.7A2.5 2.5 0 0 0 12 21z" /></svg>
    </button>
    <button class="btn btn-ghost btn-icon">Exportar</button>
    <button class="btn btn-primary">Adicionar Resultado</button>
    <div class="user-meta">
      <div class="avatar">
        <img src="https://i.pravatar.cc/48?img=32" alt="Admin" />
      </div>
      <div>
        <div class="user-name">Admin</div>
        <div class="user-role">Organizador</div>
      </div>
    </div>
  </div>
</header>
