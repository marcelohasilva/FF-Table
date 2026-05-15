<script lang="ts">
  export let label = '';
  export let value = '';
  export let meta = '';
  export let accent: 'purple' | 'blue' | 'pink' | 'teal' = 'purple';
</script>

<div class="stat-card card">
  <div class={`stat-icon ${accent}`}>
    <slot name="icon"></slot>
  </div>
  <div class="stat-info">
    <div class="stat-label">{label}</div>
    <div class="stat-value">{value}</div>
    {#if meta}
      <div class="stat-meta">{meta}</div>
    {/if}
  </div>
</div>
