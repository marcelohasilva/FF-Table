<script lang="ts">
  export let label = '';
  export let value = '';
  export let caption = '';
  export let accent: 'purple' | 'blue' | 'gold' = 'purple';
</script>

<div class={`highlight-card ${accent}`}>
  <div class="highlight-icon">
    <slot name="icon"></slot>
  </div>
  <div class="highlight-label">{label}</div>
  <div class="highlight-value">{value}</div>
  {#if caption}
    <div class="highlight-caption">{caption}</div>
  {/if}
</div>
