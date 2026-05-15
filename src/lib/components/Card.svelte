<script lang="ts">
  export let title = '';
  export let subtitle = '';
  export let actionLabel = '';
</script>

<div class="card">
  {#if title}
    <div class="card-header">
      <div>
        <div class="card-title">{title}</div>
        {#if subtitle}
          <div class="card-subtitle">{subtitle}</div>
        {/if}
      </div>
      {#if actionLabel}
        <button class="btn btn-ghost btn-small">{actionLabel}</button>
      {/if}
    </div>
  {/if}
  <div class="card-body">
    <slot></slot>
  </div>
</div>
