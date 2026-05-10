<script lang="ts">
  import type { OcrSuggestion } from '$lib/types';

  export let suggestions: OcrSuggestion[] = [];
  export let ocrText = '';
  export let processing = false;
  export let onFileChange: (event: Event) => void;
  export let onUseSuggestion: (suggestion: OcrSuggestion) => void;
</script>

<section class="panel">
  <div class="panel-header">
    <div>
      <p class="eyebrow">OCR opcional</p>
      <h2>Upload de print</h2>
    </div>
    <span class="counter">Beta</span>
  </div>

  <label class="upload-box">
    <input accept="image/*" type="file" on:change={onFileChange} />
    <span>{processing ? 'Lendo print...' : 'Selecione uma imagem de resultado'}</span>
  </label>

  <p class="hint">O OCR tenta sugerir nome do squad e kills. Revise antes de salvar.</p>

  {#if suggestions.length > 0}
    <div class="suggestions">
      {#each suggestions as suggestion}
        <button class="suggestion" type="button" on:click={() => onUseSuggestion(suggestion)}>
          <strong>{suggestion.squadName}</strong>
          <span>{suggestion.kills} kills</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if ocrText}
    <details>
      <summary>Texto extraído</summary>
      <pre>{ocrText}</pre>
    </details>
  {/if}
</section>
