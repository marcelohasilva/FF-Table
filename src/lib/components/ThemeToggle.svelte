<script lang="ts">
  export let theme: 'dark' | 'light' = 'dark';
  export let onToggle: () => void;
</script>

<button class="theme-toggle" type="button" on:click={onToggle}>
  {theme === 'dark' ? '☀️ Tema claro' : '🌙 Tema escuro'}
</button>
